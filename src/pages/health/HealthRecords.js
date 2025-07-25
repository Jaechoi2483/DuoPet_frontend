// D:\final_project\DuoPet_frontend\src\pages\health\HealthRecords.js
import React, { useState, useEffect } from 'react';
import styles from './HealthRecords.module.css';
import Modal from '../../components/common/Modal'; // 1. 공용 모달 컴포넌트 가져오기
import FileUploader from '../../components/common/FileUploader'; // 파일 업로드 컴포넌트
import PagingView from '../../components/common/pagingView'; // 페이징 컴포넌트
import { createHealthRecord, getHealthRecordsByPet, updateHealthRecord, deleteHealthRecord } from '../../api/healthApi';

// 다른 컴포넌트 import
import Vaccination from './Vaccination';
import Weight from './Weight';
import HospitalVisit from './HospitalVisit';
import Schedule from './Schedule';

const HealthRecords = ({ pet }) => {
  const [activeSubTab, setActiveSubTab] = useState('records');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [healthRecords, setHealthRecords] = useState([]); // 실제 데이터를 저장할 상태
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false); // 업로드할 실제 파일 객체
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    date: '',
    hospitalName: '',
    veterinarian: '',
    content: '',
    files: [] // 업로드된 파일 정보
  });
  
  // 페이징 관련 state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // 페이지당 3개씩 표시

  // 탭 메뉴 데이터
  const subTabs = [
    { id: 'records', label: '건강 기록' },
    { id: 'vaccination', label: '예방 접종' },
    { id: 'weight', label: '체중 변화' },
    { id: 'hospital', label: '병원 방문' },
    { id: 'schedule', label: '일정 관리' },
  ];

  // 반려동물이 선택되면 건강 기록을 불러옴
  useEffect(() => {
    if (pet?.petId) {
      fetchHealthRecords();
    }
  }, [pet]);

  // 건강 기록 목록 조회
  const fetchHealthRecords = async () => {
    try {
      setLoading(true);
      const records = await getHealthRecordsByPet(pet.petId);
      setHealthRecords(records);
    } catch (error) {
      console.error('건강 기록 조회 실패:', error);
      alert('건강 기록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 건강 기록 카드 클릭 시 상세 보기
  const handleRecordClick = (record) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
    setIsEditMode(false);
  };

  // 수정 모드로 전환
  const handleEditClick = () => {
    setFormData({
      type: selectedRecord.recordType,
      title: selectedRecord.title,
      date: selectedRecord.recordDate,
      hospitalName: selectedRecord.hospitalName || '',
      veterinarian: selectedRecord.veterinarian || '',
      content: selectedRecord.content || '',
    });
    setIsEditMode(true);
  };

  // 건강 기록 삭제
  const handleDeleteRecord = async () => {
    if (!window.confirm('정말로 이 건강 기록을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteHealthRecord(selectedRecord.recordId);
      alert('건강 기록이 삭제되었습니다.');
      setIsDetailModalOpen(false);
      fetchHealthRecords(); // 목록 새로고침
    } catch (error) {
      console.error('건강 기록 삭제 실패:', error);
      alert('건강 기록 삭제에 실패했습니다.');
    }
  };

  // 건강 기록 수정
  const handleUpdateRecord = async () => {
    try {
      const updateData = {
        recordType: formData.type,
        title: formData.title,
        recordDate: formData.date,
        hospitalName: formData.hospitalName,
        veterinarian: formData.veterinarian,
        content: formData.content,
      };

      await updateHealthRecord(selectedRecord.recordId, updateData);
      alert('건강 기록이 수정되었습니다.');
      setIsDetailModalOpen(false);
      setIsEditMode(false);
      fetchHealthRecords(); // 목록 새로고침
    } catch (error) {
      console.error('건강 기록 수정 실패:', error);
      alert('건강 기록 수정에 실패했습니다.');
    }
  };

  // TODO: 실제 데이터 연동 시 제거 예정 - 현재는 UI 확인용 더미 데이터
  // 임시 건강 기록 데이터
  const dummyHealthRecords = [
    {
      id: 1,
      type: '정기검진',
      title: '정기 건강검진',
      date: '2024-06-15',
      veterinarian: '김수의사',
      content: '전반적인 건강 상태 양호. 체중 관리 필요.',
      status: '완료',
    },
    {
      id: 2,
      type: '예방접종',
      title: '광견병 백신',
      date: '2024-05-20',
      veterinarian: '이수의사',
      content: '연간 광견병 예방접종 완료',
      status: '완료',
    },
    {
      id: 3,
      type: '예방접종',
      title: '종합백신 (DHPP)',
      date: '2025-03-10',
      veterinarian: '김수의사',
      content: '홍역, 간염, 파보바이러스 등 종합 예방접종',
      status: '예정',
    },
  ];

  // 폼 입력값 변경 핸들러
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 파일 업로드 완료 핸들러
  const handleFileUploadComplete = (files) => {
    // FileUploader에서 실제 File 객체 배열을 받음
    setUploadedFiles(files);
    console.log('업로드할 파일:', files);
  };

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    if (!formData.type || !formData.title || !formData.date) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    
    if (!pet?.petId) {
      alert('반려동물을 선택해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      
      // API에 전달할 데이터 준비
      const recordData = {
        petId: pet.petId,
        recordType: formData.type,
        title: formData.title,
        recordDate: formData.date,
        hospitalName: formData.hospitalName,
        veterinarian: formData.veterinarian,
        content: formData.content,
        status: '완료'
      };
      
      // 건강 기록 생성
      await createHealthRecord(recordData, uploadedFiles);
      
      // 목록 새로고침
      await fetchHealthRecords();
      
      // 모달 닫기 및 폼 초기화
      setIsModalOpen(false);
      setFormData({
        type: '',
        title: '',
        date: '',
        hospitalName: '',
        veterinarian: '',
        content: '',
        files: []
      });
      setUploadedFiles([]);
      
      alert('건강 기록이 추가되었습니다.');
    } catch (error) {
      console.error('건강 기록 생성 실패:', error);
      alert('건강 기록 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // '건강 기록' 탭 렌더링 함수
  const renderHealthRecords = () => {
    // 날짜순으로 정렬 (최신순)
    const sortedRecords = [...healthRecords].sort((a, b) => 
      new Date(b.recordDate) - new Date(a.recordDate)
    );
    
    // 페이징 계산
    const totalPage = Math.ceil(sortedRecords.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRecords = sortedRecords.slice(startIndex, endIndex);
    
    // 페이징 그룹 계산
    const pageGroup = Math.ceil(currentPage / 10);
    const startPage = (pageGroup - 1) * 10 + 1;
    const endPage = Math.min(pageGroup * 10, totalPage);

    return (
      <div className={styles.recordsContainer}>
        <div className={styles.recordsHeader}>
          <h3 className={styles.recordsTitle}>건강 기록</h3>
          <button
            className={styles.addButton}
            onClick={() => setIsModalOpen(true)} // 모달 열기
          >
            + 기록 추가
          </button>
        </div>

        <div className={styles.recordsList}>
          {loading ? (
            <div className={styles.loading}>건강 기록을 불러오는 중...</div>
          ) : sortedRecords.length > 0 ? (
            currentRecords.length > 0 ? (
              currentRecords.map((record) => (
            <div 
              key={record.recordId} 
              className={styles.recordItem}
              onClick={() => handleRecordClick(record)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.recordHeader}>
                <span className={styles.recordType}>{record.recordType}</span>
                <span
                  className={`${styles.recordStatus} ${
                    record.status === '완료' ? styles.completed : styles.scheduled
                  }`}
                >
                  {record.status}
                </span>
              </div>
              <h4 className={styles.recordTitle}>{record.title}</h4>
              <div className={styles.recordDetails}>
                <span className={styles.recordDate}>📅 {record.recordDate}</span>
                {record.hospitalName && (
                  <span className={styles.recordHospital}>
                    🏥 {record.hospitalName}
                  </span>
                )}
                {record.veterinarian && (
                  <span className={styles.recordVet}>
                    👨‍⚕️ {record.veterinarian}
                  </span>
                )}
              </div>
              <p className={styles.recordContent}>{record.content}</p>
              {record.files && record.files.length > 0 && (
                <div className={styles.recordFiles}>
                  📎 첨부파일 {record.files.length}개
                </div>
              )}
            </div>
          ))
            ) : (
              <div className={styles.emptyState}>
                <p>현재 페이지에 표시할 건강 기록이 없습니다.</p>
              </div>
            )
          ) : (
            <div className={styles.emptyState}>
              <p>등록된 건강 기록이 없습니다.</p>
              <p>위의 '기록 추가' 버튼을 눌러 첫 번째 기록을 추가해보세요.</p>
            </div>
          )}
      </div>
      
      {/* 페이징 */}
      {totalPage > 1 && (
        <PagingView
          currentPage={currentPage}
          totalPage={totalPage}
          startPage={startPage}
          endPage={endPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
  };

  // 현재 활성화된 탭에 따라 다른 컴포넌트를 렌더링
  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'records':
        return renderHealthRecords();
      case 'vaccination':
        return <Vaccination pet={pet} />;
      case 'weight':
        return <Weight pet={pet} />;
      case 'hospital':
        return <HospitalVisit pet={pet} />;
      case 'schedule':
        return <Schedule pet={pet} />;
      default:
        return renderHealthRecords();
    }
  };

  return (
    <>
      {/* 상단 요약 카드 섹션 */}
      <div className={styles.summarySection}>{/* ... 요약 카드 JSX ... */}</div>

      {/* 서브 탭 메뉴 섹션 */}
      <div className={styles.subTabsContainer}>
        <div className={styles.subTabsList}>
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.subTabItem} ${
                activeSubTab === tab.id ? styles.active : ''
              }`}
              onClick={() => setActiveSubTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 영역 */}
      <div className={styles.tabContent}>{renderSubTabContent()}</div>

      {/* 2. 공용 Modal 컴포넌트 사용 */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {/* Modal의 children으로 들어갈 내용 */}
        {/* 닫기 버튼은 Modal 컴포넌트가 이미 가지고 있으므로 여기선 제거합니다. */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>건강 기록 추가</h2>
        </div>

        <div className={styles.modalContent}>
          <p className={styles.modalSubtitle}>
            반려동물의 새로운 건강 기록을 추가하세요.
          </p>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>종류</label>
            <select
              className={styles.formSelect}
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
            >
              <option value="">기록 종류 선택</option>
              <option value="정기검진">정기검진</option>
              <option value="예방접종">예방접종</option>
              <option value="치료">치료</option>
              <option value="응급처치">응급처치</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>제목</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="예: 정기 건강검진"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>날짜</label>
            <input
              type="date"
              className={styles.formInput}
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>병원명</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="병원명을 입력하세요"
              value={formData.hospitalName}
              onChange={(e) => handleInputChange('hospitalName', e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>수의사</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="담당 수의사명"
              value={formData.veterinarian}
              onChange={(e) =>
                handleInputChange('veterinarian', e.target.value)
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>내용</label>
            <textarea
              className={styles.formTextarea}
              placeholder="상세 내용을 입력하세요"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>첨부 파일</label>
            <FileUploader
              onUploadComplete={handleFileUploadComplete}
              allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'application/pdf']}
              maxSize={10485760} // 10MB
              maxFiles={5}
            />
            {uploadedFiles.length > 0 && (
              <p className={styles.fileCount}>
                {uploadedFiles.length}개 파일 첨부됨
              </p>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.submitButton} onClick={handleSubmit}>
            저장
          </button>
        </div>
      </Modal>

      {/* 건강 기록 상세 보기 모달 */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
        {selectedRecord && (
          <>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {isEditMode ? '건강 기록 수정' : '건강 기록 상세'}
              </h2>
            </div>

            <div className={styles.modalContent}>
              {!isEditMode ? (
                // 상세 보기 모드
                <>
                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>종류</span>
                    <span className={styles.detailValue}>{selectedRecord.recordType}</span>
                  </div>
                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>제목</span>
                    <span className={styles.detailValue}>{selectedRecord.title}</span>
                  </div>
                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>날짜</span>
                    <span className={styles.detailValue}>{selectedRecord.recordDate}</span>
                  </div>
                  {selectedRecord.hospitalName && (
                    <div className={styles.detailGroup}>
                      <span className={styles.detailLabel}>병원명</span>
                      <span className={styles.detailValue}>{selectedRecord.hospitalName}</span>
                    </div>
                  )}
                  {selectedRecord.veterinarian && (
                    <div className={styles.detailGroup}>
                      <span className={styles.detailLabel}>수의사</span>
                      <span className={styles.detailValue}>{selectedRecord.veterinarian}</span>
                    </div>
                  )}
                  {selectedRecord.content && (
                    <div className={styles.detailGroup}>
                      <span className={styles.detailLabel}>내용</span>
                      <p className={styles.detailContent}>{selectedRecord.content}</p>
                    </div>
                  )}
                  {selectedRecord.files && selectedRecord.files.length > 0 && (
                    <div className={styles.detailGroup}>
                      <span className={styles.detailLabel}>첨부 파일</span>
                      <div className={styles.fileList}>
                        {selectedRecord.files.map((file, index) => (
                          <div key={index} className={styles.fileItem}>
                            📎 {file.originalFilename}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // 수정 모드
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>종류</label>
                    <select
                      className={styles.formSelect}
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                    >
                      <option value="">기록 종류 선택</option>
                      <option value="정기검진">정기검진</option>
                      <option value="예방접종">예방접종</option>
                      <option value="치료">치료</option>
                      <option value="응급처치">응급처치</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>제목</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>날짜</label>
                    <input
                      type="date"
                      className={styles.formInput}
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>병원명</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formData.hospitalName}
                      onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>수의사</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formData.veterinarian}
                      onChange={(e) => handleInputChange('veterinarian', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>내용</label>
                    <textarea
                      className={styles.formTextarea}
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      rows={4}
                    />
                  </div>
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              {!isEditMode ? (
                <>
                  <button 
                    className={styles.editButton} 
                    onClick={handleEditClick}
                    style={{ position: 'absolute', right: '124px' }}
                  >
                    수정
                  </button>
                  <button 
                    className={styles.deleteButton} 
                    onClick={handleDeleteRecord}
                    style={{ position: 'absolute', right: '24px' }}
                  >
                    삭제
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className={styles.cancelButton} 
                    onClick={() => setIsEditMode(false)}
                    style={{ marginRight: '10px' }}
                  >
                    취소
                  </button>
                  <button 
                    className={styles.submitButton} 
                    onClick={handleUpdateRecord}
                  >
                    저장
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default HealthRecords;
