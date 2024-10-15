import { db } from '@/api/firebase';
import BreadcrumbComponent from '@/components/breadcrumb';
import ExamHeader from '@/components/groups/exam-header';
import GroupHeader from '@/components/groups/header';
import { useMainContext } from '@/context/main-context';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const GroupExam = () => {
  const { groupId, examId } = useParams();
  const userId = '9qS2pojPEhf7JOCZNUb4Cvwev6C3';

  const { groups, courses } = useMainContext();
  const group = groups.find((g) => g.id === groupId);

  const [exams, setExams] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);

  const exam = exams.find((ex) => ex.id === examId);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const examsRef = collection(
          db,
          `users/${userId}/groups/${groupId}/exams`
        );
        const querySnapshot = await getDocs(examsRef);

        const examsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setExams(examsList);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchExams();
  }, [userId, groupId]);

  if (!group) {
    return (
      <div className="px-4 lg:px-8 mx-auto py-4">
        <h2 className="text-2xl font-bold tracking-tight">Yuklanmoqda</h2>
        <p className="text-muted-foreground">
          Siz qidirayotgan guruh topilmadi!
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-8 mt-4">
      <BreadcrumbComponent
        title="Guruhlar ro'yxati"
        titleLink="/groups"
        subtitle={`${
          courses.filter((item) => item.id === group.courseId)[0].courseTitle
        } #${group.groupNumber}`}
      />
      <ExamHeader exam={exam} />
    </div>
  );
};

export default GroupExam;
