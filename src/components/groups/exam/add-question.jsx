import { useFieldArray, useForm } from 'react-hook-form';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/api/firebase';

import { PlusCircle, Save, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

function AddQuestion({ adminId, groupId, examId, fetch }) {
  const { toast } = useToast();
  const { control, register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      questions: [{ title: '', answers: ['', '', '', ''], correctAnswer: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const addQuestion = async (questionData) => {
    try {
      const questionsCollectionRef = collection(
        db,
        `users/${adminId}/groups/${groupId}/exams/${examId}/questions`
      );

      await addDoc(questionsCollectionRef, {
        ...questionData,
        createdAt: serverTimestamp(),
      });

      fetch();
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const onSubmit = async (data) => {
    for (const question of data.questions) {
      await addQuestion(question);
    }
    reset();
    toast({
      title: 'All questions have been saved',
    });
  };

  const addNewQuestion = () => {
    append({ title: '', answers: ['', '', '', ''], correctAnswer: '' });
  };

  const watchQuestions = watch('questions');

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="flex justify-end">
          <Button type="submit" className="h-9 flex items-center gap-1.5 mt-4">
            <Save className="h-4 w-4 -ml-1" />
            <span>Saqlash</span>
          </Button>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-3 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  required
                  htmlFor={`questions.${index}.title`}
                  className="block font-medium"
                >
                  {index + 1}. Savol sarlovhasi
                </Label>
                {index > 0 && (
                  <button
                    title="Remove question"
                    onClick={() => remove(index)}
                    className="text-red-500 p-2 rounded-md bg-accent"
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </button>
                )}
              </div>
              <Input
                id={`questions.${index}.title`}
                {...register(`questions.${index}.title`, {
                  required: true,
                })}
                placeholder="Savol sarlovhasini yozing."
                className="Input"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['a', 'b', 'c', 'd'].map((option, answerIndex) => (
                <div key={option} className="space-y-2">
                  <Label
                    required
                    htmlFor={`questions.${index}.answers.${answerIndex}`}
                    className="block font-medium"
                  >
                    Answer {option.toUpperCase()}
                  </Label>
                  <div className="relative">
                    <Input
                      id={`questions.${index}.answers.${answerIndex}`}
                      {...register(
                        `questions.${index}.answers.${answerIndex}`,
                        { required: true }
                      )}
                      placeholder={`Variant ${option.toUpperCase()}`}
                      className="input mr-2"
                    />
                    <input
                      type="radio"
                      required
                      {...register(`questions.${index}.correctAnswer`)}
                      value={option}
                      checked={watchQuestions[index]?.correctAnswer === option}
                      onChange={() =>
                        setValue(`questions.${index}.correctAnswer`, option)
                      }
                      className="absolute top-1/2 -translate-y-1/2 right-3 z-10 h-4 w-4 cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </form>
      <Button
        type="button"
        onClick={addNewQuestion}
        className="h-9 flex items-center gap-1.5 mt-4"
      >
        <PlusCircle className="h-4 w-4 -ml-1" />
        <span>Yangi savol</span>
      </Button>
    </div>
  );
}

export default AddQuestion;
