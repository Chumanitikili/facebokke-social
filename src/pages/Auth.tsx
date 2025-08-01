import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface SignUpForm {
  fullName: string;
  email: string;
  password: string;
}

interface SignInForm {
  email: string;
  password: string;
}

const Auth = () => {
  const { user, signUp, signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const signUpForm = useForm<SignUpForm>();
  const signInForm = useForm<SignInForm>();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSignUp = async (data: SignUpForm) => {
    setLoading(true);
    const { error } = await signUp(data.email, data.password, data.fullName);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Registrasie suksesvol! Tjek jou e-pos vir bevestiging.');
    }
    setLoading(false);
  };

  const onSignIn = async (data: SignInForm) => {
    setLoading(true);
    const { error } = await signIn(data.email, data.password);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welkom terug by FACEBOKKE!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">FACEBOKKE</CardTitle>
          <CardDescription>
            Verbind met jou tjommies regoor Suid-Afrika
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Teken In</TabsTrigger>
              <TabsTrigger value="signup">Registreer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    rules={{ required: 'E-pos adres is nodig' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-pos Adres</FormLabel>
                        <FormControl>
                          <Input placeholder="jou@email.co.za" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signInForm.control}
                    name="password"
                    rules={{ required: 'Wagwoord is nodig' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wagwoord</FormLabel>
                        <FormControl>
                          <Input placeholder="Jou wagwoord" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Besig om in te teken...' : 'Teken In'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="signup">
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                  <FormField
                    control={signUpForm.control}
                    name="fullName"
                    rules={{ required: 'Volle naam is nodig' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volle Naam</FormLabel>
                        <FormControl>
                          <Input placeholder="Jou volle naam" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    rules={{ required: 'E-pos adres is nodig' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-pos Adres</FormLabel>
                        <FormControl>
                          <Input placeholder="jou@email.co.za" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    rules={{ 
                      required: 'Wagwoord is nodig',
                      minLength: { value: 6, message: 'Wagwoord moet minstens 6 karakters wees' }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wagwoord</FormLabel>
                        <FormControl>
                          <Input placeholder="Kies 'n wagwoord" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Besig om te registreer...' : 'Registreer'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;