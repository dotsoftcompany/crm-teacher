import { db } from '@/api/firebase';
import BreadcrumbComponent from '@/components/breadcrumb';
import AddQuestion from '@/components/groups/exam/add-question';
import ExamHeader from '@/components/groups/exam/exam-header';
import Questions from '@/components/groups/exam/questions';
import GroupHeader from '@/components/groups/header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useMainContext } from '@/context/main-context';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { PlusCircle, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

const GroupExam = () => {
  const { teacherData } = useMainContext();

  const adminId = teacherData?.role;
  const { groupId, examId } = useParams();

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
          `users/${adminId}/groups/${groupId}/exams`
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
  }, [adminId, groupId]);

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
      <ExamHeader exam={exam} loading={loading} />

      <Tabs defaultValue="questions" className="py-4">
        <TabsList>
          <TabsTrigger value="questions">Savollar</TabsTrigger>
          <TabsTrigger value="add-question">Savol qo'shish</TabsTrigger>
        </TabsList>
        <TabsContent value="questions">
          <Questions adminId={adminId} groupId={groupId} examId={examId} />
        </TabsContent>
        <TabsContent value="add-question">
          <AddQuestion adminId={adminId} groupId={groupId} examId={examId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupExam;
