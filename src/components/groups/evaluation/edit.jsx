import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/api/firebase';
import { useMainContext } from '@/context/main-context';
import { Loader, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';

function EditEvaluation({ id, evaluations, setOpen, groupId, fetch }) {
  const { teacherData } = useMainContext();
  const adminId = teacherData?.role;

  const evaluation = evaluations.find((evaluation) => evaluation.id === id);

  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debounceRef = useRef(null);

  const { toast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (evaluation) {
      reset(evaluation);
    }
  }, [evaluation, reset]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchTerm) {
        const filtered = evaluation?.students?.filter((student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStudents(filtered);
      } else {
        setFilteredStudents(evaluation?.students || []);
      }
    }, 300);

    return () => {
      clearTimeout(debounceRef.current);
    };
  }, [searchTerm, evaluation]);

  const onSubmit = async (data) => {
    try {
      const ref = doc(
        db,
        `users/${adminId}/groups/${groupId}/evaluations/${id}`
      );

      await updateDoc(ref, data);
      toast({
        title: 'Evaluation updated successfully',
      });
    } catch (error) {
      console.error('Error updating evaluation:', error);
      toast({
        title: 'Failed to update evaluation',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      reset();
      fetch();
      setOpen(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <Input
            className="peer pe-9 ps-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student..."
            type="search"
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <Search size={16} strokeWidth={2} />
          </div>
        </div>
        <Controller
          name="timestamp"
          control={control}
          defaultValue={
            evaluation?.timestamp
              ? new Date(
                  evaluation.timestamp.seconds * 1000 +
                    evaluation.timestamp.nanoseconds / 1e6
                )
              : null
          }
          render={({ field }) => {
            const dateValue =
              field.value && field.value.seconds
                ? new Date(
                    field.value.seconds * 1000 + field.value.nanoseconds / 1e6
                  )
                : field.value;

            return (
              <ReactDatePicker
                selected={dateValue}
                onChange={(date) => field.onChange(date)}
                dateFormat="dd.MM.yyyy"
                className="w-28 py-2 px-3 border rounded-md bg-background"
                placeholderText="Select a date"
                
              />
            );
          }}
        />
      </div>

      <ScrollArea className="h-[300px] w-full">
        {filteredStudents.map((student, index) => (
          <div
            key={student.id}
            className="grid grid-cols-1 lg:grid-cols-3 items-start gap-2 w-full"
          >
            <input type="hidden" {...register(`students.${index}.id`)} />

            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                className="disabled:opacity-90"
                type="text"
                {...register(`students.${index}.name`)}
                disabled
              />
            </div>

            <fieldset className="space-y-1 col-span-2 mt-2">
              <div className="flex justify-between text-xs font-medium">
                <p>😡 Bad</p>
                <p>Good 😍</p>
              </div>

              <Controller
                name={`students.${index}.score`}
                control={control}
                defaultValue={student.score || '-'}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                    className="flex gap-0 -space-x-px rounded-lg shadow-sm"
                  >
                    {['-', '1', '2', '3', '4', '5'].map((number) => (
                      <label
                        key={number}
                        className={`relative flex size-9 h-10 flex-1 cursor-pointer flex-col items-center justify-center gap-3 border border-input text-center text-sm font-medium ring-offset-background transition-colors first:rounded-s-lg last:rounded-e-lg ${
                          field.value === number ? 'border-ring z-10 bg-accent' : ''
                        }`}
                      >
                        <RadioGroupItem
                          value={number}
                          id={`student-${student.id}-score-${number}`}
                          onClick={() => field.onChange(number)} // Ensure the field updates on click
                          className="sr-only"
                        />
                        {number}
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
            </fieldset>
          </div>
        ))}
      </ScrollArea>

      <Button
        disabled={isSubmitting}
        className="flex items-center float-right gap-1.5"
        type="submit"
      >
        {isSubmitting && <Loader className="w-3 h-3 animate-spin" />}
        <span>Yangilash</span>
      </Button>
    </form>
  );
}

export default EditEvaluation;
