// components/context/SignupContext.js

import { createContext, useState } from 'react';

export const SignupContext = createContext();

export const SignupProvider = ({ children }) => {
  const [signupData, setSignupData] = useState({
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
    status: 'ACTIVE',
    faceRecognitionId: '',
    renameFilename: '',
    originalFilename: '',
  });

  return (
    <SignupContext.Provider value={{ signupData, setSignupData }}>
      {children}
    </SignupContext.Provider>
  );
};
