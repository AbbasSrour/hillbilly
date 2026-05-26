import { type ReactNode, createContext, useContext } from 'react';

export interface ProjectConfigOptions {
  logoSmall: string;
  logoLarge: string;
}

export const ProjectContext = createContext<ProjectConfigOptions | null>(null);

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }

  return context;
}

interface ProjectProviderInterface extends ProjectConfigOptions {
  children: ReactNode;
}

export const ProjectProvider = ({ children, ...props }: ProjectProviderInterface) => {
  return <ProjectContext.Provider value={props}>{children}</ProjectContext.Provider>;
};
