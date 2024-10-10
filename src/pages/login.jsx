import { auth, db } from '@/api/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMainContext } from '@/context/main-context';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';

export const description =
  "A login page with two columns. The first column has the login form with email and password. There's a Forgot your passwork link and a link to sign up if you do not have an account. The second column has a cover image.";

export const containerClassName = 'w-full h-full p-4 lg:p-0';

function Login() {
  const { teachers, setTeachers } = useMainContext();
  const [data, setData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setData({
      ...data,
      [e.target.name]: value,
    });
  };

  const signIn = async () => {
    const userId = '9qS2pojPEhf7JOCZNUb4Cvwev6C3'; // Replace with current admin's user ID

    try {
      // Reference to the teachers collection for the specific user
      const teachersRef = collection(db, `users/${userId}/teachers`);
      const q = query(teachersRef, where('username', '==', data.username));

      const querySnapshot = await getDocs(q);

      // Check if a teacher document was found
      if (querySnapshot.empty) {
        throw new Error('No teacher found with this username.');
      }

      const teacherDoc = querySnapshot.docs[0];

      // Check the password
      if (teacherDoc.data().password === data.password) {
        console.log('Login successful!');
        setTeachers(teacherDoc.data()); // Store teacher info in state
      } else {
        throw new Error('Incorrect password.');
      }
    } catch (error) {
      console.error('Login failed:', error.message);
      setTeachers(null); // Reset teacher info on failure
    }
  };

  console.log(teachers);

  return (
    <div className="w-full lg:grid lg:grid-cols-2 h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your username and password below to login to your account
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                required
                value={data.username}
                onChange={handleChange}
                name="username"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={data.password}
                onChange={handleChange}
                name="password"
              />
            </div>
            <Button className="w-full" onClick={signIn}>
              Login
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <img
          src="/vite.svg"
          alt="Image"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}

export default Login;
