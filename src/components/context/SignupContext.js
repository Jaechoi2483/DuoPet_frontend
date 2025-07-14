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
    userProfileRenameFilename: '', // 🔹 변경
    userProfileOriginalFilename: '',

    // VET 테이블용
    specialization: '',
    licenseNumber: '',
    hospital: '',
    website: '',
    licenseFile: null,
    vetFileRenameFilename: '', // 🔹 추가
    vetFileOriginalFilename: '',
    isCustomSpecialization: false,

    // SHELTER 테이블용
    shelterName: '',
    capacity: '',
    operatingHours: '',
  });

  return <SignupContext.Provider value={{ signupData, setSignupData }}>{children}</SignupContext.Provider>;
};
