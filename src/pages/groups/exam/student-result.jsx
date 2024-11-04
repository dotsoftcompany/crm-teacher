import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMainContext } from '@/context/main-context';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/api/firebase';

import BreadcrumbComponent from '@/components/breadcrumb';
import ExamStudentHeader from '@/components/groups/exam/student-header';

function StudentResult() {
  const { groupId, examId, studentId } = useParams();
  const { adminId } = useMainContext();

  const [groupStudents, setGroupStudents] = useState([]);
  const [submittedStudents, setSubmittedStudents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);

  const fetchGroupStudents = async () => {
    setLoading(true);

    try {
      const groupRef = doc(db, `users/${adminId}/groups`, groupId);
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        const studentIds = groupData.students || [];
        console.log('Student IDs:', studentIds);

        if (studentIds.length > 0) {
          const studentsRef = collection(db, `students`);
          const q = query(
            studentsRef,
            where('__name__', 'in', studentIds.slice(0, 10))
          ); // Only the first 10 IDs

          const querySnapshot = await getDocs(q);
          const fetchedStudents = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setGroupStudents(fetchedStudents);
        } else {
          setGroupStudents([]);
        }
      } else {
        console.log('Group not found.');
      }
    } catch (error) {
      console.error('Error fetching group data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmittedStudents = async () => {
    try {
      const submittedStudentsRef = collection(
        db,
        `users/${adminId}/groups/${groupId}/exams/${examId}/submittedStudents`
      );
      const querySnapshot = await getDocs(submittedStudentsRef);

      const submittedStudentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSubmittedStudents(submittedStudentsList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupStudents();
    fetchSubmittedStudents();
  }, [adminId, groupId]);

  const mergedStudents = groupStudents.map((groupStudent) => {
    const submittedStudent = submittedStudents.find(
      (subStudent) => subStudent.id === groupStudent.id
    );

    return submittedStudent || groupStudent;
  });

  const student = mergedStudents.find((s) => s.id === studentId);

  return (
    <div className="px-4 lg:px-8 mx-auto my-4 space-y-4">
      <BreadcrumbComponent
        title="O'quvchilar ro'yxati"
        titleLink="/students"
        subtitle="John Doe"
      />
      <ExamStudentHeader student={student} />
    </div>
  );
}

export default StudentResult;
