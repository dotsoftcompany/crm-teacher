import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useParams } from 'react-router-dom';
import { useMainContext } from '@/context/main-context';
import { useEffect, useRef, useState } from 'react';
import AddEvaluation from '@/components/dialogs/add-evaluation';
import { X } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/api/firebase';
import { format } from 'date-fns';
import DeleteAlert from '@/components/dialogs/delete-alert';

function Evaluation({ groupId, students }) {
  const { adminId } = useMainContext();
  const [openAddEvaluation, setOpenAddEvaluation] = useState(false);
  const [loading, setLoading] = useState(true);

  const [id, setId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const convertTimestampToDate = (timestamp) => {
    return new Date(timestamp.seconds * 1000);
  };

  const sortedEvaluations = evaluations.sort(
    (a, b) => a.timestamp.seconds - b.timestamp.seconds
  );

  const filteredEvaluations = sortedEvaluations.filter((evaluation) => {
    if (!selectedDate) return true;

    const evaluationDate = convertTimestampToDate(evaluation.timestamp);
    return (
      evaluationDate.toLocaleDateString('en-GB') ===
      selectedDate.toLocaleDateString('en-GB')
    );
  });

  const clearDate = () => setSelectedDate(null);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const evaluationsRef = collection(
        db,
        `users/${adminId}/groups/${groupId}/evaluations`
      );
      const querySnapshot = await getDocs(evaluationsRef);

      const evaluationsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEvaluations(evaluationsList);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [adminId, groupId]);

  return (
    <>
      <AddEvaluation
        open={openAddEvaluation}
        setOpen={setOpenAddEvaluation}
        groupId={groupId}
        groupStudents={students}
        fetch={fetchEvaluations}
      />

      <DeleteAlert
        id={id}
        collection={`users/${adminId}/groups/${groupId}/evaluations`}
        open={openDelete}
        setOpen={setOpenDelete}
        fetch={fetchEvaluations}
      />

      <div className="space-y-2 pt-2">
        <div className="flex justify-between items-center">
          <h2 className="hidden lg:block text-lg font-bold tracking-tight">
            O'quvchilar ballari
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <ReactDatePicker
                placeholderText="Select date"
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="dd.MM.yyyy"
                className="w-fit py-2 px-3 border rounded-md bg-background"
              />
              {selectedDate && (
                <X
                  onClick={clearDate}
                  className="absolute top-1/2 -translate-y-1/2 right-2 h-4 w-4 cursor-pointer"
                />
              )}
            </div>
            <Button
              onClick={() => setOpenAddEvaluation(true)}
              variant="secondary"
              className="dark:bg-white dark:text-black"
            >
              Baholash
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg">
          <div className="inline-flex border border-border rounded-lg min-w-fit">
            <div className="flex-shrink-0 w-44 md:w-52 !sticky left-0 bg-muted/50 z-10 shadow">
              <div className="font-medium text-sm p-4 border-b border-border">
                Student's Name
              </div>
              {students.map((student) => (
                <div
                  key={student.id}
                  className="p-4 text-sm border-b  border-border whitespace-nowrap truncate bg-muted/50"
                >
                  {student.fullName}
                </div>
              ))}
            </div>

            <div className="flex overflow-x-auto rounded-r-lg">
              {filteredEvaluations.map((evaluation) => {
                function formatDate(timestamp) {
                  const { seconds, nanoseconds } = timestamp;
                  const date = new Date(seconds * 1000 + nanoseconds / 1000000);
                  return format(date, 'dd.MM.yy');
                }
                return (
                  <div key={evaluation.id} className="flex-shrink-0 group">
                    <div className="relative p-4 border-l  border-border border-b bg-muted/50">
                      <span className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-medium group-hover:invisible">
                        {formatDate(evaluation.timestamp)}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="invisible group-hover:visible"
                          asChild
                          aria-hidden="true"
                        >
                          <Button
                            variant="ghost"
                            className="flex h-[1.25rem] w-8 p-0 data-[state=open]:bg-muted rounded-sm"
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
                            className="!text-sm"
                            onSelect={() => {
                              // setOpenEdit(true);
                              document.body.style.pointerEvents = '';
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="!text-sm"
                            onSelect={() => {
                              setOpenDelete(true);
                              setId(evaluation.id);
                              document.body.style.pointerEvents = '';
                            }}
                          >
                            Delete
                            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {students.map((student) => {
                      const studentScore =
                        evaluation.students.find((s) => s.id === student.id)
                          ?.score || '-';

                      return (
                        <div
                          key={student.id}
                          className={`flex items-center text-sm justify-center p-4 border-l border-b  border-border font-bold`}
                        >
                          {studentScore}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {filteredEvaluations.length === 0 && (
                <div className="flex-shrink-0 group flex items-center justify-center w-14">
                  <p className="-rotate-90 text-muted-foreground text-sm whitespace-nowrap">
                    Ma'lumot topilmadi.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Evaluation;
