'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { GenericModule } from '@/components/generic-module';

export default function GenericModulePage() {
  const pathname = usePathname();
  return <GenericModule path={pathname} />;
}
