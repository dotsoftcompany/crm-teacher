import { auth, db } from '@/api/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';

const MainContext = createContext({});

export const useMainContext = () => {
  return useContext(MainContext);
};

export const MainContextProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [groupStudents, setGroupStudents] = useState([]);
  const [teacher, setTeacher] = useState([]);
  const [teacherData, setTeacherData] = useState([]);
  const [teacherId, setTeacherId] = useState();
  const [loading, setLoading] = useState(false);

  const adminId = teacherData?.role;

  useEffect(() => {
    if (adminId && teacherId) {
      const fetchTeacherGroupsData = async () => {
        const groupsCollectionRef = collection(db, `users/${adminId}/groups`);
        const groupsQuery = query(
          groupsCollectionRef,
          where('teacherId', '==', teacherId)
        );

        const unsubscribe = onSnapshot(groupsQuery, (snapshot) => {
          const groupsArray = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setGroups(groupsArray);
        });

        return unsubscribe;
      };

      fetchTeacherGroupsData();
    }
  }, [adminId, teacherId]);

  useEffect(() => {
    if (adminId) {
      const fetchTeacherCoursesData = async () => {
        const coursesCollectionRef = collection(db, `users/${adminId}/courses`);

        const unsubscribe = onSnapshot(coursesCollectionRef, (snapshot) => {
          const coursesArray = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setCourses(coursesArray);
        });

        return unsubscribe;
      };

      fetchTeacherCoursesData();
    }
  }, [adminId]);

  useEffect(() => {
    if (adminId) {
      const fetchTeacherStudentsData = async () => {
        const studentsCollectionRef = collection(db, `students`);
        const studentsQuery = query(
          studentsCollectionRef,
          where('adminId', '==', adminId)
        );

        const unsubscribe = onSnapshot(studentsQuery, (snapshot) => {
          const studentsArray = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setStudents(studentsArray);
        });

        return unsubscribe;
      };

      fetchTeacherStudentsData();
    }
  }, [adminId]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (teacher) => {
      if (teacher) {
        setTeacher(teacher);
        setTeacherId(teacher.uid);
      } else {
        setTeacher(null);
        setTeacherId(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (teacherId) {
      const fetchTeacherData = async () => {
        const userDocRef = doc(db, 'teachers', teacherId);

        const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            setTeacherData({ ...docSnapshot.data(), id: docSnapshot.id });
          } else {
            console.warn('No matching document found with the provided ID.');
          }
        });

        return unsubscribe;
      };
      fetchTeacherData();
    }
  }, [teacherId]);

  const signInUser = (email, password) => {
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {})
      .catch((error) => {
        console.error('Login error:', error);
      })
      .finally(() => setLoading(false));
  };

  const logoutUser = () => {
    signOut(auth);
  };

  const contextValue = {
    adminId,
    teacher,
    teacherData,
    signInUser,
    isOpen,
    setIsOpen,
    setTeacher,
    logoutUser,
    courses,
    teachers,
    setTeachers,
    groups,
    students,
    groupStudents,
    setGroupStudents,
  };

  return (
    <MainContext.Provider value={contextValue}>{children}</MainContext.Provider>
  );
};
