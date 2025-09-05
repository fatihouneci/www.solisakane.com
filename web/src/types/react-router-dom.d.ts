/**
 * @file react-router-dom.d.ts
 * @description
 * EN: Type definitions for react-router-dom v7.
 * FR: Définitions de types pour react-router-dom v7.
 */

declare module 'react-router-dom' {
  import { ComponentType, ReactNode } from 'react';
  import { NavigateOptions, To } from 'react-router';

  export interface BrowserRouterProps {
    basename?: string;
    children?: ReactNode;
  }

  export interface RoutesProps {
    children?: ReactNode;
  }

  export interface RouteProps {
    path?: string;
    element?: ReactNode;
    children?: ReactNode;
  }

  export interface LinkProps {
    to: To;
    children?: ReactNode;
    className?: string;
    onClick?: () => void;
  }

  export interface NavigateFunction {
    (to: To, options?: NavigateOptions): void;
  }

  export function BrowserRouter(props: BrowserRouterProps): JSX.Element;
  export function Routes(props: RoutesProps): JSX.Element;
  export function Route(props: RouteProps): JSX.Element;
  export function Link(props: LinkProps): JSX.Element;
  export function useNavigate(): NavigateFunction;
  export function useLocation(): { pathname: string; search: string; hash: string; state: any };
  export function useParams(): Record<string, string | undefined>;
  export function useSearchParams(): [URLSearchParams, (params: URLSearchParams) => void];
  export function useRouteError(): any;
  export function useNavigationType(): 'POP' | 'PUSH' | 'REPLACE';
  export function useOutlet(): ReactNode | null;
  export function useOutletContext<T = any>(): T;
  export function useResolvedPath(to: To): { pathname: string; search: string; hash: string };
  export function useMatches(): Array<{
    id: string;
    pathname: string;
    params: Record<string, string>;
    data: any;
    handle: any;
  }>;
  export function useLoaderData<T = any>(): T;
  export function useActionData<T = any>(): T;
  export function useFetcher<T = any>(): {
    data: T;
    state: 'idle' | 'loading' | 'submitting';
    formMethod: string | null;
    formAction: string | null;
    formData: FormData | null;
    formEncType: string | null;
    submit: (target: any, options?: any) => void;
    load: (href: string) => void;
  };
  export function useFetchers(): Array<{
    data: any;
    state: 'idle' | 'loading' | 'submitting';
    formMethod: string | null;
    formAction: string | null;
    formData: FormData | null;
    formEncType: string | null;
    submit: (target: any, options?: any) => void;
    load: (href: string) => void;
  }>;
  export function useRevalidator(): {
    state: 'idle' | 'loading';
    revalidate: () => void;
  };
  export function useRevalidators(): Array<{
    state: 'idle' | 'loading';
    revalidate: () => void;
  }>;
  export function useBeforeUnload(callback: (event: BeforeUnloadEvent) => void): void;
  export function useBlocker(blocker: (args: any) => boolean): void;
  export function usePrompt(message: string, when?: boolean): void;
  export function useScrollRestoration(): void;
  export function useViewTransitionState(): boolean;
  export function useId(): string;
  export function useIsPending(): boolean;
  export function useNavigation(): {
    state: 'idle' | 'loading' | 'submitting';
    location: { pathname: string; search: string; hash: string; state: any };
    formMethod: string | null;
    formAction: string | null;
    formData: FormData | null;
    formEncType: string | null;
  };
  export function useRouteLoaderData(routeId: string): any;
  export function useMatches(): Array<{
    id: string;
    pathname: string;
    params: Record<string, string>;
    data: any;
    handle: any;
  }>;
  export function useLoaderData<T = any>(): T;
  export function useActionData<T = any>(): T;
  export function useFetcher<T = any>(): {
    data: T;
    state: 'idle' | 'loading' | 'submitting';
    formMethod: string | null;
    formAction: string | null;
    formData: FormData | null;
    formEncType: string | null;
    submit: (target: any, options?: any) => void;
    load: (href: string) => void;
  };
  export function useFetchers(): Array<{
    data: any;
    state: 'idle' | 'loading' | 'submitting';
    formMethod: string | null;
    formAction: string | null;
    formData: FormData | null;
    formEncType: string | null;
    submit: (target: any, options?: any) => void;
    load: (href: string) => void;
  }>;
  export function useRevalidator(): {
    state: 'idle' | 'loading';
    revalidate: () => void;
  };
  export function useRevalidators(): Array<{
    state: 'idle' | 'loading';
    revalidate: () => void;
  }>;
  export function useBeforeUnload(callback: (event: BeforeUnloadEvent) => void): void;
  export function useBlocker(blocker: (args: any) => boolean): void;
  export function usePrompt(message: string, when?: boolean): void;
  export function useScrollRestoration(): void;
  export function useViewTransitionState(): boolean;
  export function useId(): string;
  export function useIsPending(): boolean;
  export function useNavigation(): {
    state: 'idle' | 'loading' | 'submitting';
    location: { pathname: string; search: string; hash: string; state: any };
    formMethod: string | null;
    formAction: string | null;
    formData: FormData | null;
    formEncType: string | null;
  };
  export function useRouteLoaderData(routeId: string): any;
}
