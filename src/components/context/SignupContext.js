// src/compoments/context/SignupContext.js

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
    role: 'USER',
    status: '',
    faceRecognitionId: '',
    userProfileRenameFilename: '',
    userProfileOriginalFilename: '',

    // VET 테이블용
    specialization: '',
    licenseNumber: '',
    hospital: '',
    vetHospitalAddress: '',
    website: '',
    licenseFile: null,
    vetFileRenameFilename: '',
    vetFileOriginalFilename: '',
    isCustomSpecialization: false,

    // SHELTER 테이블용
    shelterName: '',
    shelterPhone: '', // 보호소 연락처 (구분된 필드)
    shelterEmail: '', // 보호소 이메일
    shelterAddress: '', // 보호소 주소
    capacity: '',
    operatingHours: '',
    shelterFileOriginalFilename: '',
    shelterFileRenameFilename: '',
    shelterProfileFile: null,
    authFileDescription: '',
  });

  return <SignupContext.Provider value={{ signupData, setSignupData }}>{children}</SignupContext.Provider>;
};
