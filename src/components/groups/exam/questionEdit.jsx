import { useFieldArray, useForm } from 'react-hook-form';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/api/firebase';

import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

function QuestionEdit({ questions, ids, fetchQuestions, setOpen }) {
  const { adminId, groupId, examId, questionId } = ids;

  // Find the specific question to edit
  const question = questions.find((q) => q.id === questionId);

  const { toast } = useToast();

  // Set up the form with flat default values
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      title: '',
      answers: ['', '', '', ''],
      correctAnswer: '',
    },
  });

  // Populate form values with the question data when it's available
  useEffect(() => {
    if (question) {
      reset({
        title: question.title,
        answers: question.answers,
        correctAnswer: question.correctAnswer,
      });
    }
  }, [question, reset]);

  const onSubmit = async (data) => {
    try {
      const questionDocRef = doc(
        db,
        `users/${adminId}/groups/${groupId}/exams/${examId}/questions`,
        questionId
      );
      await updateDoc(questionDocRef, data);
      reset();
      fetchQuestions();
      setOpen(false);
      toast({
        title: 'Muvaffaqiyatli yangilandi.',
      });
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  const correctAnswer = watch('correctAnswer');

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="space-y-3 mt-4">
          <div className="space-y-2">
            <Label required htmlFor="title" className="block font-medium">
              Question Title
            </Label>
            <Input
              id="title"
              {...register('title', { required: true })}
              placeholder="Enter question title."
              className="Input"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['a', 'b', 'c', 'd'].map((option, answerIndex) => (
              <div key={option} className="space-y-2 relative">
                <Label
                  required
                  htmlFor={`answers.${answerIndex}`}
                  className="block font-medium"
                >
                  Answer {option.toUpperCase()}
                </Label>
                <Input
                  id={`answers.${answerIndex}`}
                  {...register(`answers.${answerIndex}`, { required: true })}
                  placeholder={`Option ${option.toUpperCase()}`}
                  className="input mr-2"
                />
                <input
                  type="radio"
                  {...register('correctAnswer', { required: true })}
                  value={option}
                  checked={correctAnswer === option}
                  onChange={() => setValue('correctAnswer', option)}
                  className="h-4 w-4 cursor-pointer absolute top-1/2 -translate-y-1/2 right-3"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" className="h-9 flex items-center gap-1.5 mt-4">
            <Save className="h-4 w-4 -ml-1" />
            <span>Save Changes</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

export default QuestionEdit;
