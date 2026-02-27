import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { EXPERIMENTS, weightedRandom } from '@/lib/ab-tests';

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  for (const exp of EXPERIMENTS) {
    const cookieName = `ab_${exp.name}`;
    const existing = request.cookies.get(cookieName);

    if (!existing) {
      const variant = weightedRandom(exp.variants, exp.weights);
      response.cookies.set({
        name: cookieName,
        value: variant,
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        sameSite: 'lax',
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|favicon\\.png|sitemap\\.xml|robots\\.txt).*)',
  ],
};
