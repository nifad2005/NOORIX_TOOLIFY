
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toolCategories, toolsList, Tool } from '@/lib/tools';

export default function HomePage() {
  const toolsByCategory: { [key: string]: Tool[] } = {};
  toolsList.forEach(tool => {
    if (!toolsByCategory[tool.category]) {
      toolsByCategory[tool.category] = [];
    }
    toolsByCategory[tool.category].push(tool);
  });

  return (
    <div className="w-full space-y-8">
      <header className="text-center py-6 md:py-10">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Welcome to Toolify</h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2">Your Suite of Handy Online Utilities</p>
      </header>

      {toolCategories.map(category => {
        const toolsInThisCategory = toolsByCategory[category.id] || [];
        if (toolsInThisCategory.length === 0) return null;

        return (
          <section key={category.id} className="w-full">
            <div className="flex items-center mb-6">
              <category.icon className="w-8 h-8 text-primary mr-3" />
              <h2 className="text-2xl md:text-3xl font-semibold">{category.name}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {toolsInThisCategory.map(tool => (
                <Card key={tool.id} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                       <div className="bg-accent/20 p-3 rounded-lg">
                        <tool.icon className="w-8 h-8 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-xl md:text-2xl font-headline">{tool.name}</CardTitle>
                        {tool.description && (
                          <CardDescription className="mt-1 text-sm">
                            {tool.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {/* Additional details about the tool can go here if needed */}
                  </CardContent>
                  <CardContent className="mt-auto pt-0">
                     <Link href={tool.href} passHref>
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        Open {tool.name.replace('Image ', '').replace('Format ','')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}

       {toolsList.length === 0 && (
        <div className="text-center py-10">
            <p className="text-xl text-muted-foreground">No tools available yet. Check back soon!</p>
        </div>
      )}

      <footer className="text-center py-10 mt-auto">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Toolify. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
