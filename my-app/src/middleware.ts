import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // // Protect dashboard route
  // if (request.nextUrl.pathname.startsWith('/dashboard')) {
  //   if (!token) {
  //     return NextResponse.redirect(new URL('/', request.url))
  //   }
  // }

//   // Protect onboarding route
//   if (request.nextUrl.pathname.startsWith('/onboarding')) {
//     if (!token) {
//       return NextResponse.redirect(new URL('/', request.url))
//     }
//   }

//   // Redirect authenticated users away from login page
//   if (request.nextUrl.pathname === '/' && token) {
//     return NextResponse.redirect(new URL('/dashboard', request.url))
//   }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}