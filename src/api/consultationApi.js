import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL 
    ? `${process.env.REACT_APP_API_BASE_URL}/api/consultation`
    : 'http://localhost:8080/api/consultation';

// console.log('[consultationApi] API_BASE_URL:', API_BASE_URL);

// Axios 인스턴스 생성
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    
    // 디버깅이 필요한 경우에만 주석 해제
    // console.log('[consultationApi] 인터셉터 실행 - accessToken:', accessToken ? '있음' : '없음');
    // console.log('[consultationApi] 인터셉터 실행 - refreshToken:', refreshToken ? '있음' : '없음');
    // console.log('[consultationApi] 인터셉터 실행 - role:', userRole);
    // console.log('[consultationApi] 인터셉터 실행 - userId:', userId);
    // console.log('[consultationApi] 요청 URL:', config.url);
    // console.log('[consultationApi] 현재 포트:', window.location.port);
    
    if (accessToken && refreshToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        config.headers.RefreshToken = `Bearer ${refreshToken}`;
        // console.log('[consultationApi] Authorization과 RefreshToken 헤더 추가됨');
    }
    
    // 인증이 필요한 요청에는 쿠키도 포함
    config.withCredentials = true;
    
    return config;
});

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 401 에러는 개별적으로 처리하도록 변경
        // 전문가 상담 페이지에서는 로그인 여부와 관계없이 접근 가능해야 함
        return Promise.reject(error);
    }
);

// 수의사 프로필 API
export const vetProfileApi = {
    // 모든 상담 가능한 수의사 목록 조회 (페이지네이션 및 필터링 지원)
    getAllAvailable: async (page = 0, size = 6, sort = 'createdAt,desc', specialty = null, onlineOnly = null) => {
        const params = { page, size, sort };
        if (specialty) params.specialty = specialty;
        if (onlineOnly !== null) params.onlineOnly = onlineOnly;
        
        // 캐시 무시를 위한 타임스탬프 추가
        params._t = Date.now();
        
        const response = await api.get('/vet-profiles/available', { params });
        return response.data;
    },

    // 온라인 수의사 목록 조회
    getOnlineVets: async () => {
        const response = await api.get('/vet-profiles/online');
        return response.data;
    },

    // 수의사 상세 정보 조회
    getVetDetail: async (vetId) => {
        const response = await api.get(`/vet-profiles/vet/${vetId}`);
        return response.data;
    },

    // 키워드로 수의사 검색
    searchVets: async (keyword) => {
        const response = await api.get('/vet-profiles/search', { params: { keyword } });
        return response.data;
    },

    // 전문 분야로 수의사 검색
    searchBySpecialty: async (specialty) => {
        const response = await api.get('/vet-profiles/specialty', { params: { specialty } });
        return response.data;
    },

    // 인기 수의사 TOP N 조회
    getTopVets: async (limit = 10) => {
        const response = await api.get('/vet-profiles/top', { params: { limit } });
        return response.data;
    },

    // 상담 가능한 수의사 목록과 상담 상태 조회
    getAllAvailableWithStatus: async (page = 0, size = 6, sort = 'createdAt,desc') => {
        const params = { page, size, sort };
        params._t = Date.now();
        
        const response = await api.get('/vet-profiles/available-with-status', { params });
        return response.data;
    },

    // 수의사 온라인 상태 업데이트
    updateOnlineStatus: async (vetId, isOnline) => {
        const response = await api.patch(`/vet-profiles/${vetId}/online-status`, null, {
            params: { isOnline }
        });
        return response.data;
    },
};

// 상담실 API
export const consultationRoomApi = {
    // 상담 신청
    createConsultation: async (consultationData) => {
        const response = await api.post('/rooms', consultationData);
        return response.data;
    },

    // 즉시 상담 신청 (일반 상담 생성 API 사용)
    createInstantConsultation: async (consultationData) => {
        const response = await api.post('/rooms', consultationData);
        return response.data;
    },

    // 내 상담 목록 조회
    getMyConsultations: async (consultationType = null) => {
        const params = {};
        if (consultationType) {
            params.consultationType = consultationType;
        }
        const response = await api.get('/rooms/my-consultations', { params });
        return response.data;
    },

    // 상담 상세 조회 (roomId)
    getConsultationDetail: async (roomId) => {
        const response = await api.get(`/rooms/${roomId}`);
        return response.data;
    },

    // 상담 상세 조회 (roomUuid)
    getConsultationDetailByUuid: async (roomUuid) => {
        const response = await api.get(`/rooms/${roomUuid}`);
        return response.data;
    },

    // 상담 시작
    startConsultation: async (roomId) => {
        const response = await api.put(`/rooms/${roomId}/start`);
        return response.data;
    },

    // 상담 종료
    endConsultation: async (roomId) => {
        const response = await api.post(`/rooms/${roomId}/end`);
        return response.data;
    },

    // 상담 취소
    cancelConsultation: async (roomId) => {
        const response = await api.put(`/rooms/${roomId}/cancel`);
        return response.data;
    },

    // 상담 승인 (전문가용)
    approveConsultation: async (roomId) => {
        const response = await api.put(`/rooms/${roomId}/approve`);
        return response.data;
    },

    // 상담 거절 (전문가용)
    rejectConsultation: async (roomId) => {
        const response = await api.put(`/rooms/${roomId}/reject`);
        return response.data;
    },
};

// 수의사 일정 API
export const vetScheduleApi = {
    // 수의사 일정 조회
    getVetSchedule: async (vetId, startDate, endDate) => {
        const response = await api.get(`/vet-schedules/vet/${vetId}`, {
            params: { startDate, endDate }
        });
        return response.data;
    },

    // 예약 가능한 일정 조회
    getAvailableSchedules: async (vetId, startDate, endDate) => {
        const response = await api.get(`/vet-schedules/vet/${vetId}/available`, {
            params: { startDate, endDate }
        });
        return response.data;
    },

    // 일정 예약
    bookSchedule: async (scheduleId) => {
        const response = await api.post(`/vet-schedules/${scheduleId}/book`);
        return response.data;
    },

    // 수의사 일정 일괄 생성 (개발용)
    createScheduleBatch: async (batchData) => {
        const response = await api.post('/vet-schedules/batch', batchData);
        return response.data;
    },
};

// 채팅 메시지 API
export const chatMessageApi = {
    // 메시지 전송
    sendMessage: async (messageData) => {
        const response = await api.post('/chat/send', messageData);
        return response.data;
    },

    // 채팅 내역 조회
    getChatHistory: async (roomId, page = 0, size = 50) => {
        const response = await api.get(`/chat/room/${roomId}/messages`, {
            params: { page, size }
        });
        return response.data;
    },

    // 읽지 않은 메시지 수 조회
    getUnreadCount: async (roomId) => {
        const response = await api.get(`/chat/room/${roomId}/unread`);
        return response.data;
    },

    // 메시지 읽음 처리
    markAsRead: async (roomId) => {
        const response = await api.put(`/chat/room/${roomId}/read`);
        return response.data;
    },
};

// 상담 후기 API
export const consultationReviewApi = {
    // 후기 작성
    createReview: async (roomId, reviewData) => {
        const response = await api.post(`/reviews/room/${roomId}`, reviewData);
        return response.data;
    },

    // 수의사별 후기 조회
    getVetReviews: async (vetId, page = 0, size = 10) => {
        const response = await api.get(`/consultation-reviews/vet/${vetId}`, {
            params: { page, size }
        });
        return response.data;
    },

    // 후기 상세 조회
    getReviewDetail: async (reviewId) => {
        const response = await api.get(`/consultation-reviews/${reviewId}`);
        return response.data;
    },

    // 내 후기 목록 조회
    getMyReviews: async () => {
        const response = await api.get('/consultation-reviews/my');
        return response.data;
    },

    // 후기 수정
    updateReview: async (reviewId, reviewData) => {
        const response = await api.put(`/consultation-reviews/${reviewId}`, reviewData);
        return response.data;
    },
};

// Q&A 상담 API
export const qnaConsultationApi = {
    // Q&A 상담 생성
    createQnaConsultation: async (formData) => {
        const response = await api.post('/qna', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Q&A 답변 작성 (수의사용)
    createAnswer: async (roomId, formData) => {
        const response = await api.post(`/qna/${roomId}/answer`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // 내 Q&A 상담 목록 조회
    getMyQnaConsultations: async (page = 0, size = 10, role = null) => {
        const params = { page, size };
        if (role) params.role = role;
        const response = await api.get('/qna/my', { params });
        return response.data;
    },

    // 수의사의 상태별 Q&A 상담 목록 조회
    getVetQnaConsultationsByStatus: async (status, page = 0, size = 10) => {
        const response = await api.get(`/qna/vet/status/${status}`, {
            params: { page, size }
        });
        return response.data;
    },

    // Q&A 상담 상세 조회
    getQnaConsultationDetail: async (roomId) => {
        const response = await api.get(`/qna/${roomId}`);
        return response.data;
    },

    // 추가 메시지 작성
    addMessage: async (roomId, formData) => {
        const response = await api.post(`/qna/${roomId}/message`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

const consultationApi = {
    vetProfileApi,
    consultationRoomApi,
    vetScheduleApi,
    chatMessageApi,
    consultationReviewApi,
    qnaConsultationApi,
};

export default consultationApi;