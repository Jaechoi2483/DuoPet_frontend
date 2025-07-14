// src/components/context/SignupContext.js

import { createContext, useState } from 'react';

export const SignupContext = createContext();

export const initialSignupData = {
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
  role: '',
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
  shelterPhone: '',
  shelterEmail: '',
  shelterAddress: '',
  capacity: '',
  operatingHours: '',
  shelterFileOriginalFilename: '',
  shelterFileRenameFilename: '',
  shelterProfileFile: null,
  authFileDescription: '',
};

export const SignupProvider = ({ children }) => {
  const [signupData, setSignupData] = useState(initialSignupData);

  return <SignupContext.Provider value={{ signupData, setSignupData }}>{children}</SignupContext.Provider>;
};
