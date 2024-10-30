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
  const [uid, setUid] = useState();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);

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

  const userId = '9qS2pojPEhf7JOCZNUb4Cvwev6C3';

  console.log(groups);

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

  // Fetch User Data from "teachers" Collection

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

  // Fetch Manager Data from "users" Collection
  useEffect(() => {
    const testDocId = '9qS2pojPEhf7JOCZNUb4Cvwev6C3'; // Replace with a valid user ID from the 'users' collection for testing
    const managerDocRef = doc(db, 'users', testDocId);

    const unsubscribe = onSnapshot(managerDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        console.log('Test ManagerData found:', docSnapshot.data());
      } else {
        console.warn('No document found with the test ID.');
      }
    });

    return unsubscribe;
  }, []);

  // Sign In Function
  const signInUser = (email, password) => {
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Optionally, add any logic after login
      })
      .catch((error) => {
        console.error('Login error:', error);
      })
      .finally(() => setLoading(false));
  };

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

    // const groupsCollection = collection(db, `users/${adminId}/groups`);
    // onSnapshot(groupsCollection, (snapshot) => {
    //   setGroups(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    // });

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
    getUsertime,
    students,
  };

  return (
    <MainContext.Provider value={contextValue}>{children}</MainContext.Provider>
  );
};
