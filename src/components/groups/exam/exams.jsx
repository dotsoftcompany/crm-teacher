import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Eye, Loader, Search } from 'lucide-react';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore';

import { useMainContext } from '@/context/main-context';
import { db } from '@/api/firebase';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

import StudentsDataTable from '@/components/students/data-table';
import GroupHeader from '@/components/groups/header';
import BreadcrumbComponent from '@/components/breadcrumb';
import EditDialog from '@/components/dialogs/edit-dialog';
import StudentEdit from '@/components/students/edit';
import AddAbsenteeDialog from '@/components/dialogs/add-absentee';
import ListAbsenteeDialog from '@/components/dialogs/list-absentee';
import DeleteAlert from '@/components/dialogs/delete-alert';
import AddExamDialog from '@/components/dialogs/add-exam';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { scoreColor } from '@/lib/utils';
import AddEvaluation from '@/components/dialogs/add-evaluation';
import { format } from 'date-fns';
import Evaluation from '@/components/groups/evaluation/evaluation';
import { Badge } from '@/components/ui/badge';
import Tasks from '@/components/groups/tasks/tasks';

function Exams({ groupId }) {
  const { adminId } = useMainContext();
  const { toast } = useToast();

  const [openAddExam, setOpenAddExam] = useState(false);
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState({});

  const [filteredExams, setFilteredExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debounceRef = useRef(null);

  const [exams, setExams] = useState([]);

  const fetchExams = async () => {
    setLoading(true);
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
      console.log(err);
    }
  };

  const toggleIsShow = useCallback(
    async (examId, currentIsShow) => {
      setDisabled((prev) => ({ ...prev, [examId]: true }));
      try {
        const examDocRef = doc(
          db,
          `users/${adminId}/groups/${groupId}/exams`,
          examId
        );
        await updateDoc(examDocRef, { isShow: !currentIsShow });
        setExams((prevExams) =>
          prevExams.map((exam) =>
            exam.id === examId ? { ...exam, isShow: !currentIsShow } : exam
          )
        );
        toast({
          title: `${
            currentIsShow
              ? "Imtihon o'quvchilardan berkitildi"
              : "Imtihon o'quvchilarga ko'rinmoqda"
          }`,
        });
      } catch (err) {
        console.error("Error updating 'isShow':", err);
      } finally {
        setDisabled((prev) => ({ ...prev, [examId]: false }));
      }
    },
    [adminId, groupId]
  );

  useEffect(() => {
    fetchExams();
  }, [adminId, groupId]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchTerm) {
        const filtered = exams.filter((exam) =>
          exam.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredExams(filtered);
      } else {
        setFilteredExams(exams);
      }
    }, 300);

    return () => {
      clearTimeout(debounceRef.current);
    };
  }, [searchTerm, exams]);

  return (
    <div>
      <AddExamDialog
        open={openAddExam}
        setOpen={setOpenAddExam}
        groupId={groupId}
        fetchExams={fetchExams}
      />

      <div className="space-y-2 pt-2">
        <div className="flex justify-between items-center">
          <div className="relative">
            <Input
              className="peer pe-9 ps-9 w-full lg:w-96"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Imtihonni qidirish..."
              type="search"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <Search size={16} strokeWidth={2} />
            </div>
          </div>
          <Button
            onClick={() => setOpenAddExam(true)}
            variant="secondary"
            className="dark:bg-white dark:text-black"
          >
            Imtihon qo'shish
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[50rem] w-full">
            {loading && (
              <TableCaption className="bg-muted/50 py-5 mt-0">
                Loading...
              </TableCaption>
            )}
            <TableHeader>
              <TableRow>
                <TableHead className="w-72 rounded-tl-md">Title</TableHead>
                <TableHead>Start date</TableHead>
                <TableHead>End date</TableHead>
                <TableHead>Place</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Is show</TableHead>
                <TableHead className="rounded-tr-md text-center">
                  View
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExams.map((exam) => (
                <TableRow>
                  <Link to={`/groups/${groupId}/exam/${exam.id}`}>
                    <TableCell className="w-72">{exam?.title}</TableCell>
                  </Link>
                  <TableCell>{exam?.start}</TableCell>
                  <TableCell>{exam?.end}</TableCell>
                  <TableCell>{exam?.type}</TableCell>
                  <TableCell>{exam?.status}</TableCell>
                  <TableCell
                    className="flex items-center mt-2.5 gap-1.5"
                    title="O'quvchilarga ko'rsatish"
                  >
                    <Switch
                      key={exam?.id}
                      disabled={!!disabled[exam.id]}
                      checked={exam?.isShow}
                      onCheckedChange={() =>
                        toggleIsShow(exam?.id, exam?.isShow)
                      }
                    />
                    <Loader
                      className={`w-4 h-4 animate-spin ${
                        !!disabled[exam.id] ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Link to={`/groups/${groupId}/exam/${exam.id}`}>
                      <Button variant="link">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Eye className="w-5 h-5" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <small>Batafsil</small>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default Exams;
