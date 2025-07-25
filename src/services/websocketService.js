import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(userType = 'USER', userId = null) {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        reject(new Error('No authentication token found'));
        return;
      }

      // SockJS를 사용한 WebSocket 연결
      // 절대 URL을 명시적으로 사용
      const wsUrl = `${process.env.REACT_APP_API_BASE_URL}/ws-consultation`;
      console.log('WebSocket 연결 URL:', wsUrl);
      const socket = new SockJS(wsUrl);
      
      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
          userType: userType,
          userId: userId || ''
        },
        debug: (str) => {
          console.log('[WebSocket Debug]', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = () => {
        console.log('WebSocket Connected');
        this.connected = true;
        this.reconnectAttempts = 0;
        
        // 전문가인 경우 개인 채널 구독
        if (userType === 'VET' && userId) {
          this.subscribeToPersonalChannel(userId); // userId는 이제 loginId여야 함
        }
        
        resolve(this.client);
      };

      this.client.onStompError = (frame) => {
        console.error('WebSocket Error:', frame.headers['message']);
        console.error('Additional details:', frame.body);
        reject(new Error(frame.headers['message']));
      };

      this.client.onWebSocketClose = () => {
        console.log('WebSocket Disconnected');
        this.connected = false;
        this.handleReconnect(userType, userId);
      };

      this.client.activate();
    });
  }

  handleReconnect(userType, userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        this.connect(userType, userId);
      }, 5000);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  // 개인 채널 구독 (전문가용)
  subscribeToPersonalChannel(loginId) {
    // 백엔드가 loginId를 사용하여 /queue/consultations로 보내므로 이를 구독
    const destination = `/user/${loginId}/queue/consultations`;
    
    if (this.subscriptions.has(destination)) {
      console.log('Already subscribed to:', destination);
      return;
    }

    const subscription = this.client.subscribe(destination, (message) => {
      const notification = JSON.parse(message.body);
      console.log('Consultation notification received:', notification);
      
      // 알림 처리
      this.handleNotification(notification);
    });

    this.subscriptions.set(destination, subscription);
  }

  // 상담방 구독
  subscribeToRoom(roomId, callbacks) {
    const destinations = {
      messages: `/topic/consultation/${roomId}`,
      typing: `/topic/consultation/${roomId}/typing`,
      status: `/topic/consultation/${roomId}/status`
    };

    // 메시지 구독
    if (!this.subscriptions.has(destinations.messages)) {
      const msgSub = this.client.subscribe(destinations.messages, (message) => {
        const chatMessage = JSON.parse(message.body);
        if (callbacks.onMessage) {
          callbacks.onMessage(chatMessage);
        }
      });
      this.subscriptions.set(destinations.messages, msgSub);
    }

    // 타이핑 구독
    if (!this.subscriptions.has(destinations.typing)) {
      const typingSub = this.client.subscribe(destinations.typing, (message) => {
        const typingData = JSON.parse(message.body);
        if (callbacks.onTyping) {
          callbacks.onTyping(typingData);
        }
      });
      this.subscriptions.set(destinations.typing, typingSub);
    }

    // 상태 구독
    if (!this.subscriptions.has(destinations.status)) {
      const statusSub = this.client.subscribe(destinations.status, (message) => {
        const statusData = JSON.parse(message.body);
        if (callbacks.onStatusChange) {
          callbacks.onStatusChange(statusData);
        }
      });
      this.subscriptions.set(destinations.status, statusSub);
    }
  }

  // 상담방 구독 해제
  unsubscribeFromRoom(roomId) {
    const destinations = [
      `/topic/consultation/${roomId}`,
      `/topic/consultation/${roomId}/typing`,
      `/topic/consultation/${roomId}/status`
    ];

    destinations.forEach(dest => {
      const subscription = this.subscriptions.get(dest);
      if (subscription) {
        subscription.unsubscribe();
        this.subscriptions.delete(dest);
      }
    });
  }

  // 메시지 전송
  sendMessage(roomId, content, messageType = 'TEXT') {
    if (!this.connected || !this.client) {
      console.error('WebSocket not connected');
      return;
    }

    const message = {
      content,
      messageType,
      timestamp: new Date().toISOString()
    };

    this.client.publish({
      destination: `/app/consultation/${roomId}/send`,
      body: JSON.stringify(message)
    });
  }

  // 타이핑 상태 전송
  sendTypingStatus(roomId, isTyping) {
    if (!this.connected || !this.client) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: `/app/consultation/${roomId}/typing`,
      body: JSON.stringify({ isTyping })
    });
  }

  // 상담실 상태 업데이트
  updateRoomStatus(roomId, status) {
    if (!this.connected || !this.client) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: `/app/consultation/${roomId}/status`,
      body: JSON.stringify({ status })
    });
  }

  // 알림 처리 (전문가용)
  handleNotification(notification) {
    switch (notification.type) {
      case 'NEW_CONSULTATION':
      case 'CONSULTATION_REQUEST':
        // 상담 요청 알림 처리
        if (window.showConsultationRequestNotification) {
          window.showConsultationRequestNotification(notification);
        }
        break;
      case 'MESSAGE':
        // 새 메시지 알림
        if (window.showMessageNotification) {
          window.showMessageNotification(notification);
        }
        break;
      default:
        console.log('Unknown notification type:', notification.type);
    }
  }

  // 연결 해제
  disconnect() {
    if (this.client) {
      // 모든 구독 해제
      this.subscriptions.forEach(subscription => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      // 연결 종료
      this.client.deactivate();
      this.connected = false;
      this.client = null;
    }
  }

  // 연결 상태 확인
  isConnected() {
    return this.connected;
  }
}

// 싱글톤 인스턴스
const websocketService = new WebSocketService();

export default websocketService;