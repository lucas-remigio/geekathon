"use client";

import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

// Updated schema to include password
const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(3, "Password must have at least 3 characters"),
});

export default function Login() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  // Set the tab name
  useEffect(() => {
    document.title = "Login - SubjectsMate";
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="themes-wrapper bg-background w-full h-full">
        <div className="flex min-h-screen items-center justify-center flex-col">
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-bold text-primary">SubjectsMate</h1>
            <p className="text-gray-500">Your Study Companion</p>
          </div>
          <Card className="rounded-lg border bg-card text-card-foreground shadow-sm mx-auto w-full max-w-lg p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-3xl font-semibold">Login</CardTitle>
              <ThemeToggle />
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-current">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-current">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="pt-4">
                    <Button type="submit" className="w-1/2 mx-auto block">
                      Submit
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
