import { createContext, useState } from 'react';

export const SignupContext = createContext();

export const SignupProvider = ({ children }) => {
  const [signupData, setSignupData] = useState({
    // USERS 테이블용
    loginId: '',
    userPwd: '',
    userName: '',
    nickname: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
    userEmail: '',
    role: 'USER', // USER, VET, SHELTER
    status: 'ACTIVE', // or 'WAITING'
    faceRecognitionId: '',
    renameFilename: '', // 프로필 이미지 or 첨부파일
    originalFilename: '',

    // VET 테이블용
    specialization: '',
    licenseNumber: '',
    hospital: '',
    website: '',
    licenseFile: null,
    isCustomSpecialization: false,

    // SHELTER 테이블용
    shelterName: '',
    capacity: '',
    operatingHours: '',
    // 프로필 이미지 제외 (파일 첨부는 보류 중)
  });

  return (
    <SignupContext.Provider value={{ signupData, setSignupData }}>
      {children}
    </SignupContext.Provider>
  );
};
