import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignupStep1.module.css'; // 공통 CSS
import { SignupContext } from '../../../components/context/SignupContext';
import apiClient from '../../../utils/axios';

function SignupStep2() {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useContext(SignupContext);
  const [nicknameAvailable, setNicknameAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState(false);
  const [phoneDuplicate, setPhoneDuplicate] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('[DEBUG] 1단계 입력값:', signupData);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupData({ ...signupData, [name]: value });
  };

  const checkNickname = async () => {
    if (!signupData.nickname || signupData.nickname.trim() === '') {
      setError('닉네임을 입력해주세요.');
      return;
    }

    try {
      const res = await apiClient.get(`/users/check-nickname?nickname=${signupData.nickname}`);
      setNicknameAvailable(!res.data);
    } catch (err) {
      console.error('[닉네임 중복 확인 오류]', err);
      setError('닉네임 확인 중 오류 발생');
    }
  };

  const checkEmail = async () => {
    if (!signupData.userEmail) {
      setError('이메일을 입력해주세요.');
      return;
    }
    try {
      const res = await apiClient.get(`/users/check-email?userEmail=${signupData.userEmail}`);
      setEmailAvailable(!res.data); // true = 중복 → 사용 불가
    } catch (err) {
      console.error('[이메일 중복 확인 오류]', err);
      alert('이메일 확인 중 오류 발생');
    }
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 11); // 숫자만
    let formatted = raw;

    if (raw.length === 11) {
      formatted = raw.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (raw.length === 10) {
      formatted = raw.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
    }

    setSignupData({ ...signupData, phone: raw }); // DB에 저장할 건 숫자만
  };

  const handleSendCode = async () => {
    if (!signupData.phone) {
      setError('전화번호를 입력해주세요.');
      return;
    }

    try {
      // 중복 체크 먼저
      const dupRes = await apiClient.get(`/users/check-phone?phone=${signupData.phone}`);
      if (dupRes.data === true) {
        alert('이미 가입된 전화번호입니다.');
        setPhoneDuplicate(true);
        setVerifiedPhone(false);
        return;
      }

      await apiClient.post('/sms/send', { phone: signupData.phone });
      alert('인증번호가 전송되었습니다.');
      setCodeSent(true);
      setError('');
    } catch {
      alert('전화번호 인증 전송 실패');
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      setError('인증번호를 입력해주세요.');
      return;
    }

    try {
      const res = await apiClient.post('/sms/verify', {
        phone: signupData.phone,
        authCode: code,
      });

      if (res.data.verified) {
        alert('인증 성공!');
        setVerifiedPhone(true);
        setPhoneDuplicate(false);
        setError('');
      } else {
        setError('인증번호가 틀렸습니다.');
      }
    } catch {
      alert('인증 확인 실패');
    }
  };

  const handleNext = async () => {
    const { userName, nickname, phone, age, gender, address, userEmail, profileFile } = signupData;

    setError('');

    if (!userName || !nickname || !phone || !age || !gender || !address || !userEmail) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('data', new Blob([JSON.stringify(signupData)], { type: 'application/json' }));
      if (profileFile) formData.append('file', profileFile);

      const response = await fetch('/users/signup/step2', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setSignupData({ ...signupData, ...result });
        navigate('/signup/step3');
      } else {
        const errorText = await response.text();
        setError(errorText);
      }
    } catch (err) {
      console.error(err);
      setError('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  const handlePrev = () => {
    navigate('/signup/step1');
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>회원가입</h2>
      <p className={styles.subtitle}>DuoPet 서비스를 위한 정보를 입력해주세요.</p>

      <div className={styles.stepHeader}>
        <div className={styles.stepItem}>기본 정보</div>
        <div className={styles.stepItemActive}>개인 정보</div>
        <div className={styles.stepItem}>가입 유형</div>
        <div className={styles.stepItem}>약관 동의</div>
      </div>

      <div className={styles.formGroup}>
        <label>실명 *</label>
        <input
          type="text"
          name="userName"
          placeholder="실명을 입력하세요"
          value={signupData.userName}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>닉네임 *</label>

        <div className={styles.inlineGroup}>
          <input
            type="text"
            name="nickname"
            placeholder="닉네임을 입력하세요"
            className={styles.inputField}
            value={signupData.nickname}
            onChange={(e) => {
              setSignupData({ ...signupData, nickname: e.target.value });
              setNicknameAvailable(null);
              setError('');
            }}
          />
          <button type="button" onClick={checkNickname} className={styles.checkButton}>
            중복 확인
          </button>
        </div>

        {/* 상태 메시지 */}
        {signupData.nickname === '' && error === '닉네임을 입력해주세요.' && (
          <div className={`${styles.statusMessage} ${styles.statusError}`}>❗ {error}</div>
        )}
        {signupData.nickname && nicknameAvailable === false && (
          <div className={`${styles.statusMessage} ${styles.statusError}`}>❌ 이미 사용 중인 닉네임입니다.</div>
        )}
        {signupData.nickname && nicknameAvailable === true && (
          <div className={`${styles.statusMessage} ${styles.statusSuccess}`}>✅ 사용 가능한 닉네임입니다.</div>
        )}
      </div>

      {/* 전화번호 입력 필드 + 인증 전송 */}
      <div className={styles.formGroup}>
        <label>전화번호 *</label>

        <div className={styles.inlineGroup}>
          <input
            type="text"
            name="phone"
            placeholder="전화번호를 입력하세요"
            className={styles.inputField}
            value={
              signupData.phone.length === 11
                ? signupData.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
                : signupData.phone
            }
            onChange={handlePhoneChange}
            disabled={verifiedPhone}
          />
          <button type="button" onClick={handleSendCode} className={styles.checkButton} disabled={verifiedPhone}>
            인증번호 전송
          </button>
        </div>

        {/* 인증번호 입력 필드 + 인증 확인 */}
        {codeSent && !verifiedPhone && (
          <div className={styles.inlineGroup}>
            <input
              type="text"
              placeholder="인증번호 입력"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={styles.inputField}
            />
            <button type="button" onClick={handleVerifyCode} className={styles.checkButton}>
              인증 확인
            </button>
          </div>
        )}

        {/* 상태 메시지 */}
        {signupData.phone === '' && error === '전화번호를 입력해주세요.' && (
          <div className={`${styles.statusMessage} ${styles.statusError}`}>❗ {error}</div>
        )}

        {code === '' && error === '인증번호를 입력해주세요.' && (
          <div className={`${styles.statusMessage} ${styles.statusError}`}>❗ {error}</div>
        )}

        {phoneDuplicate && (
          <div className={`${styles.statusMessage} ${styles.statusError}`}>❌ 이미 가입된 전화번호입니다.</div>
        )}

        {verifiedPhone && <div className={`${styles.statusMessage} ${styles.statusSuccess}`}>✅ 인증 완료</div>}
      </div>

      <div className={styles.formGroup}>
        <label>나이 *</label>
        <input
          type="number"
          name="age"
          placeholder="나이를 입력하세요"
          value={signupData.age}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>성별 *</label>
        <div className={styles.genderGroup}>
          {['남성', '여성'].map((label) => (
            <label key={label} className={`${styles.genderCard} ${signupData.gender === label ? styles.selected : ''}`}>
              <input
                type="radio"
                name="gender"
                value={label}
                checked={signupData.gender === label}
                onChange={handleChange}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>주소 *</label>
        <input
          type="text"
          name="address"
          placeholder="주소를 입력하세요"
          value={signupData.address}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>이메일 *</label>

        <div className={styles.inlineGroup}>
          <input
            type="email"
            name="userEmail"
            placeholder="이메일을 입력하세요"
            className={styles.inputField}
            value={signupData.userEmail}
            onChange={(e) => {
              setSignupData({ ...signupData, userEmail: e.target.value });
              setEmailAvailable(null);
              setError('');
            }}
          />
          <button type="button" onClick={checkEmail} className={styles.checkButton}>
            중복 확인
          </button>
        </div>

        {/* 상태 메시지 */}
        {signupData.userEmail === '' && error === '이메일을 입력해주세요.' && (
          <div className={`${styles.statusMessage} ${styles.statusError}`}>❗ {error}</div>
        )}
        {signupData.userEmail && emailAvailable === false && (
          <div className={`${styles.statusMessage} ${styles.statusError}`}>❌ 이미 사용 중인 이메일입니다.</div>
        )}
        {signupData.userEmail && emailAvailable === true && (
          <div className={`${styles.statusMessage} ${styles.statusSuccess}`}>✅ 사용 가능한 이메일입니다.</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label>프로필 이미지</label>
        {signupData.profilePreview && (
          <div className={styles.imagePreview}>
            <img src={signupData.profilePreview} alt="미리보기" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const previewUrl = URL.createObjectURL(file);
              setSignupData({
                ...signupData,
                profilePreview: previewUrl,
                userProfileOriginalFilename: file.name,
                userProfileRenameFilename: '', // 나중에 step2 응답으로 채워짐
                profileFile: file,
              });
            }
          }}
        />
      </div>

      {error &&
        error !== '닉네임을 입력해주세요.' &&
        error !== '이메일을 입력해주세요.' && ( // 이메일 에러도 전역 출력에서 제외
          <p className={styles.globalError}>{error}</p>
        )}

      <div className={styles.buttonGroup}>
        <button type="button" className={styles.prevButton} onClick={handlePrev}>
          이전 단계
        </button>
        <button type="button" className={styles.nextButton} onClick={handleNext}>
          다음 단계
        </button>
      </div>
    </div>
  );
}

export default SignupStep2;
