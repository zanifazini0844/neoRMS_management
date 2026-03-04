import React from 'react';
import { Shield } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/shared/ui/card';

export default function AuthCard({ title, description, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 text-neutral-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 md:flex-row md:items-stretch">
        {/* Left: Large neoRMS ring logo */}
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-3">
          <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-[#C3110C] bg-white shadow-lg md:h-52 md:w-52">
            <span className="select-none text-center text-xl font-extrabold leading-tight tracking-tight text-[#C3110C] md:text-2xl">
              neo
              <br />
              RMS
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Shield className="w-6 h-6 text-[#C3110C]" />
            <p className="text-2xl font-bold tracking-tight text-[#C3110C]">
              Admin Panel
            </p>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500 text-center">
            Restaurant Management System
          </p>
        </div>

        {/* Right: Auth form card */}
        <div className="w-full max-w-md flex-1">
          <Card className="rounded-2xl border border-[#C3110C] bg-white shadow-lg">
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="text-2xl font-semibold tracking-tight text-neutral-900">
                {title}
              </CardTitle>
              {description ? (
                <CardDescription className="text-neutral-500">
                  {description}
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent className="pt-0">{children}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

