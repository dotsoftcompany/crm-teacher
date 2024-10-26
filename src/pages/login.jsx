import { auth } from '@/api/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMainContext } from '@/context/main-context';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';

export const description =
  "A login page with two columns. The first column has the login form with email and password. There's a Forgot your password link and a link to sign up if you do not have an account. The second column has a cover image.";

export const containerClassName = 'w-full h-full p-4 lg:p-0';

function Login() {
  const { teachers, signInUser } = useMainContext();
  const [data, setData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const signIn = async () => {
    const email = `${data.username}@teacher.uz`;
    const password = data.password;

    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signInUser(email, password);
    } catch (err) {
      setError('Failed to log in. Please check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:grid-cols-2 h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-muted-foreground">
              Enter your username and password below to login to your account.
            </p>
          </div>
          {error && <p className="text-red-500">{error}</p>}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showPassword ? 'Hide' : 'Show'} Password
                </button>
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
            <Button className="w-full" onClick={signIn} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <img
          src="/vite.svg"
          alt="Cover Image"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}

export default Login;
