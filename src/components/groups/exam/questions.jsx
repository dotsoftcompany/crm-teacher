import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/api/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import EditDialog from '@/components/dialogs/edit-dialog';
import DeleteAlert from '@/components/dialogs/delete-alert';
import QuestionEdit from './questionEdit';

function Questions({ adminId, groupId, examId }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [id, setId] = useState('');
  const options = ['A', 'B', 'C', 'D'];

  const fetchQuestions = async () => {
    try {
      const questionsRef = collection(
        db,
        `users/${adminId}/groups/${groupId}/exams/${examId}/questions`
      );
      const querySnapshot = await getDocs(questionsRef);

      const questionsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setQuestions(questionsList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [adminId, groupId, examId]);

  if (loading) {
    return (
      <ul className="w-full">
        {Array.from({ length: 3 }).map((_, index) => (
          <li key={index} className="w-full">
            <div className="flex items-center justify-between my-2">
              {/* Skeleton for question title */}
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="border border-border rounded-md">
              {/* Skeleton for answers */}
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center py-2.5 px-4 first:rounded-t-md last:rounded-b-md border-b border-border"
                >
                  <Skeleton className="w-5 h-5 rounded-full mr-4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (error) return <p>Error fetching questions: {error}</p>;

  return (
    <div>
      <EditDialog open={openEdit} setOpen={setOpenEdit}>
        <QuestionEdit
          questions={questions}
          ids={{
            adminId: adminId,
            groupId: groupId,
            examId: examId,
            questionId: id,
          }}
          fetchQuestions={fetchQuestions}
          setOpen={setOpenEdit}
        />
      </EditDialog>

      <DeleteAlert
        id={id}
        collection={`users/${adminId}/groups/${groupId}/exams/${examId}/questions`}
        fetchQuestions={fetchQuestions}
        open={openDelete}
        setOpen={setOpenDelete}
      />

      {!questions.length && (
        <p className="text-center text-muted-foreground my-10">
          Hali savol qo'shilmagan
        </p>
      )}

      <ul className="w-full">
        {questions.map((question) => (
          <li className="w-full">
            <span className="flex items-center justify-between my-2">
              <h2 className="text-lg font-semibold">{question.title}</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                      />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenEdit(true);
                      setId(question.id);
                      document.body.style.pointerEvents = '';
                    }}
                  >
                    Tahrirlash
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDelete(true);
                      setId(question.id);
                      document.body.style.pointerEvents = '';
                    }}
                  >
                    O'chirish
                    <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </span>
            <ul className="border border-border rounded-md">
              {question.answers.map((option, index) => (
                <li
                  key={option.id}
                  className={`flex items-center py-2.5 px-4 first:rounded-t-md last:rounded-b-md border-b border-border ${
                    question.correctAnswer === String.fromCharCode(97 + index)
                      ? 'bg-blue-500'
                      : 'bg-background'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center rounded-full text-xs w-5 h-5 p-1 ${
                      question.correctAnswer === String.fromCharCode(97 + index)
                        ? 'bg-white text-blue-500'
                        : 'bg-blue-500'
                    }`}
                  >
                    {options[index]}
                  </span>
                  <span className="text-sm ml-4">{option}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Questions;
