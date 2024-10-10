import { auth, db } from '@/api/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';

const MainContext = createContext({});

export const useMainContext = () => {
  return useContext(MainContext);
};

export const MainContextProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState([]);
  const [uid, setUid] = useState();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);

  console.log('teachers', teachers);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (res) => {
      if (res) {
        setUser(res);
        setUid(auth.currentUser.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  console.log(teachers);

  const userId = '9qS2pojPEhf7JOCZNUb4Cvwev6C3';

  useEffect(() => {
    const coursesCollection = collection(db, `users/${userId}/courses`);
    onSnapshot(coursesCollection, (snapshot) => {
      setCourses(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });

    const teachersCollection = collection(db, `users/${userId}/teachers`);
    onSnapshot(teachersCollection, (snapshot) => {
      if (!snapshot.empty) {
        const firstDoc = snapshot.docs[0]; // Access the first document
        setTeachers({ ...firstDoc.data(), id: firstDoc.id }); // Set state with the first document
      } else {
        console.log('No documents found');
      }
    });

    const groupsCollection = collection(db, `users/${userId}/groups`);
    onSnapshot(groupsCollection, (snapshot) => {
      setGroups(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });

    const studentsCollection = collection(db, `users/${userId}/students`);
    onSnapshot(studentsCollection, (snapshot) => {
      setStudents(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
  }, [uid]);

  const logoutUser = () => {
    signOut(auth);
  };

  function addLeadingzero(d) {
    return d < 10 ? '0' + d : d;
  }

  function getUsertime(t) {
    let Y = t.getUTCFullYear();
    let M = addLeadingzero(t.getMonth() + 1);
    let D = addLeadingzero(t.getDate());
    return `${D}.${M}.${Y}`;
  }

  const contextValue = {
    isOpen,
    setIsOpen,
    user,
    setUser,
    logoutUser,
    courses,
    teachers,
    setTeachers,
    groups,
    getUsertime,
    students,
  };

  return (
    <MainContext.Provider value={contextValue}>{children}</MainContext.Provider>
  );
};
