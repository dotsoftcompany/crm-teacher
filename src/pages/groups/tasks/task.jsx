import { db } from '@/api/firebase';
import BreadcrumbComponent from '@/components/breadcrumb';
import AddQuestion from '@/components/groups/exam/add-question';
import ExamHeader from '@/components/groups/exam/exam-header';
import Questions from '@/components/groups/exam/questions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useMainContext } from '@/context/main-context';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import {
  Eye,
  Image,
  Paperclip,
  PlusCircle,
  Search,
  Send,
  Trash,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import TaskHeader from '@/components/groups/tasks/task-header';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const GroupTask = () => {
  const { adminId, teacherData } = useMainContext();
  const { groupId, taskId } = useParams();

  const { groups, courses } = useMainContext();
  const group = groups.find((g) => g.id === groupId);

  const [tasks, setTasks] = useState([]);
  const [groupStudents, setGroupStudents] = useState([]);
  const [submittedStudents, setSubmittedStudents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);

  const task = tasks.find((ex) => ex.id === taskId);

  const fetchTasks = async () => {
    try {
      const ref = collection(db, `users/${adminId}/groups/${groupId}/tasks`);
      const querySnapshot = await getDocs(ref);

      const tasksList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTasks(tasksList);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchGroupStudents = useCallback(async () => {
    try {
      const groupRef = doc(db, `users/${adminId}/groups`, groupId);
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        const studentIds = groupData.students || [];

        if (studentIds.length > 0) {
          const studentsRef = collection(db, `students`);
          const q = query(studentsRef, where('__name__', 'in', studentIds));

          const querySnapshot = await getDocs(q);
          const fetchedStudents = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setGroupStudents(fetchedStudents);
        } else {
          setGroupStudents([]);
        }
      }
    } catch (error) {
      console.error('Error fetching group data:', error);
    } finally {
    }
  }, [adminId, groupId]);

  useEffect(() => {
    fetchTasks();
    fetchGroupStudents();
  }, [adminId, groupId]);

  function formatDate(timestamp) {
    const date = new Date(timestamp);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} - ${hours}:${minutes}`;
  }

  const getInitials = (fullName) => {
    const nameParts = fullName.split(' ');

    if (nameParts.length === 1) {
      return nameParts[0].slice(0, 2).toUpperCase();
    } else {
      return nameParts[0][0].toUpperCase() + nameParts[1][0].toUpperCase();
    }
  };

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
        subtitleLink={`/groups/${groupId}`}
        subtitle2={`${task?.title} (task)`}
      />
      <TaskHeader task={task} loading={loading} />

      {/* <div className="flex items-center gap-2 mt-2">
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-border hover:border-ring duration-200 cursor-pointer">
          <Paperclip className="w-5 h-5" />
          <div>
            <h4 className="text-sm font-medium">Open Pdf file new window</h4>
            <p className="text-sm text-muted-foreground">attached.pdf</p>
          </div>
        </div>
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-border hover:border-ring duration-200 cursor-pointer">
          <Paperclip className="w-5 h-5" />
          <div>
            <h4 className="text-sm font-medium">Open Pdf file new window</h4>
            <p className="text-sm text-muted-foreground">attached2.pdf</p>
          </div>
        </div>
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-border hover:border-ring duration-200 cursor-pointer">
          <Image className="w-5 h-5" />
          <div>
            <h4 className="text-sm font-medium">Open Image file new window</h4>
            <p className="text-sm text-muted-foreground">attached.jpg</p>
          </div>
        </div>
      </div> */}

      {/* Chat */}

      <div className="relative border border-border rounded-md my-2 h-screen">
        <div className="w-full p-4 bg-muted rounded-t-md">
          <h4 className="text-sm">{`${
            courses.filter((item) => item.id === group.courseId)[0].courseTitle
          } #${group.groupNumber}`}</h4>
          <p className="text-muted-foreground text-sm">
            {groupStudents?.length} members
          </p>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-120px)]">
          {' '}
          {/* Updated */}
          <div className="p-4">
            <div className="w-full flex items-center justify-center my-3">
              <Badge variant="secondary">Wednesday, July 25th</Badge>
            </div>

            <div>
              <div className="flex items-start gap-2 my-2">
                <Avatar
                  title={teacherData?.fullName}
                  className="cursor-pointer"
                >
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {getInitials(teacherData?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-border hover:border-ring duration-200 cursor-pointer bg-muted">
                    <Paperclip className="w-5 h-5" />
                    <div>
                      <h4 className="text-sm font-medium">
                        Open Pdf file new window
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        attached.pdf
                      </p>
                    </div>
                  </div>
                  <small className="text-muted-foreground float-right mr-2">
                    12:39
                  </small>
                </div>
              </div>
              <div className="flex items-start gap-2 my-2">
                <Avatar
                  title={teacherData?.fullName}
                  className="cursor-pointer"
                >
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {getInitials(teacherData?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-border hover:border-ring duration-200 cursor-pointer bg-muted">
                    <Image className="w-5 h-5" />
                    <div>
                      <h4 className="text-sm font-medium">
                        Open Image file new window
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        attached.jpg
                      </p>
                    </div>
                  </div>
                  <small className="text-muted-foreground float-right mr-2">
                    12:39
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 w-full p-4 bg-muted rounded-b-md flex items-center gap-2">
          <Input className="w-full" placeholder="Type here your message..." />
          <button className="bg-background hover:opacity-80 duration-200 flex items-center justify-center p-3 cursor-pointer rounded-md">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupTask;
