import { db } from '@/api/firebase';

import { useMainContext } from '@/context/main-context';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import BreadcrumbComponent from '@/components/breadcrumb';
import ExamStudentHeader from '@/components/groups/exam/student-header';
import {
  Badge,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock,
  Dot,
  HelpCircle,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

function StudentResult() {
  const { adminId } = useMainContext();
  const { groupId, examId, studentId } = useParams();

  const [submittedStudents, setSubmittedStudents] = useState([]);
  const [groupStudents, setGroupStudents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  console.log(groupStudents);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Group Students
      const groupRef = doc(db, `users/${adminId}/groups`, groupId);
      const groupSnap = await getDoc(groupRef);
      let fetchedStudents = [];

      if (groupSnap.exists()) {
        const studentIds = groupSnap.data().students || [];
        if (studentIds.length > 0) {
          const studentsRef = collection(db, `students`);
          const studentsQuery = query(
            studentsRef,
            where('__name__', 'in', studentIds.slice(0, 10)) // Fetch only the first 10 IDs
          );
          const studentsSnapshot = await getDocs(studentsQuery);
          fetchedStudents = studentsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        }
      }

      const submittedStudentsRef = collection(
        db,
        `users/${adminId}/groups/${groupId}/exams/${examId}/submittedStudents`
      );
      const submittedSnapshot = await getDocs(submittedStudentsRef);
      const submittedList = submittedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setGroupStudents(fetchedStudents);
      setSubmittedStudents(submittedList);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const questionsRef = collection(
        db,
        `users/${adminId}/groups/${groupId}/exams/${examId}/questions`
      );

      const questionsQuery = query(questionsRef, orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(questionsQuery);

      const questionsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setQuestions(questionsList);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminId && groupId) {
      fetchData();
    }
  }, [adminId, groupId]);

  useEffect(() => {
    if (adminId && groupId && examId) {
      fetchQuestions();
    }
  }, [adminId, groupId, examId]);

  function calculateStudentResults(questions, submittedStudents) {
    return submittedStudents.map((student) => {
      const { id, fullName, answers: studentAnswers, timestamp } = student;
      let correctCount = 0;

      // Map questions to display title, student answer text, and correctness
      const results = questions.map((question, index) => {
        const correctAnswerIndex =
          question.correctAnswer.toLowerCase().charCodeAt(0) - 97; // Convert 'a' -> 0, 'b' -> 1, etc.
        const studentAnswerIndex =
          studentAnswers[index]?.toLowerCase().charCodeAt(0) - 97;

        const isCorrect = studentAnswerIndex === correctAnswerIndex;
        if (isCorrect) correctCount++;

        // Get the student's answer text based on their choice
        const studentAnswerText =
          question.answers[studentAnswerIndex] || 'No Answer';

        // Return the mapped result
        return {
          title: question.title,
          studentAnswer: studentAnswerText,
          correct: isCorrect ? true : false,
        };
      });

      // Calculate the percentage of correct answers
      const totalQuestions = questions.length;
      const rawPercentage = (correctCount / totalQuestions) * 100;
      const correctPercentage = parseFloat(rawPercentage.toFixed(2));

      return {
        id,
        fullName,
        correctCount,
        correctPercentage,
        results,
        timestamp,
      };
    });
  }

  const results = calculateStudentResults(questions, submittedStudents);

  const mergedStudents = groupStudents.map((groupStudent) => {
    const submittedStudent = results.find(
      (subStudent) => subStudent.id === groupStudent.id
    );

    return submittedStudent || groupStudent;
  });

  const student = mergedStudents.find((s) => s.id === studentId);

  console.log(results);

  return (
    <div className="px-4 lg:px-8 mx-auto my-4 space-y-4">
      <BreadcrumbComponent
        title="O'quvchilar ro'yxati"
        titleLink="/students"
        subtitle="John Doe"
      />
      <ExamStudentHeader
        student={student}
        questions={questions}
        loading={loading}
      />

      <div className="my-5 space-y-2">
        <ul className="flex flex-wrap items-center gap-2">
          {student?.results?.map((answer, index) => (
            <li className="relative bg-muted hover:bg-muted/80 rounded w-14 h-10 flex items-center justify-center">
              <span className="font-medium">{index + 1}</span>
              {answer?.correct ? (
                <span className="absolute top-0 right-0 py-0.5 px-1 rounded-bl-sm bg-green-500 text-white">
                  <Check className="h-3 w-3" />
                </span>
              ) : (
                <span className="absolute top-0 right-0 py-0.5 px-1 rounded-bl-sm bg-red-500 text-white">
                  <X className="h-3 w-3" />
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs">
              To'g'ri javoblar <b>{student?.correctCount}</b>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs">
              Noto'g'ri javoblar
              <b> {questions?.length - student?.correctCount}</b>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <span className="text-xs">
              O'tkazib yuborilganlari
              <b> 0</b>
            </span>
          </div>
        </div>
      </div>

      <div>
        <ul className="space-y-2 w-full">
          {student?.results?.map((answer, index) => (
            <Card className="w-full">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground dark:bg-muted/80 text-white">
                      <HelpCircle className="h-3 w-3" />
                    </div>
                    <span className="font-medium">{index + 1}. Savol</span>
                    <Dot className="h-3 w-3" />
                    {answer.correct ? (
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-green-500 text-white">
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          To'g'ri
                        </span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-red-500 text-white">
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Noto'g'ri
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <h2 className="mt-4 text-lg font-medium">{answer?.title}</h2>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-5 w-1 rounded ${
                      answer.correct ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <p className="mt-1 text-base text-muted-foreground">
                    {answer?.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default StudentResult;
