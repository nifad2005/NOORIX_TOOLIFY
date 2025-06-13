import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageUp } from 'lucide-react'; // Changed icon to be more relevant

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8 bg-background">
      <header className="text-center py-10">
        <h1 className="text-5xl font-bold font-headline text-primary">Toolify</h1>
        <p className="text-xl text-muted-foreground mt-2">Your Suite of Handy Online Utilities</p>
      </header>

      <section className="w-full max-w-2xl">
        <h2 className="text-3xl font-semibold mb-6 text-center">Available Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="bg-accent/20 p-3 rounded-lg">
                  <ImageUp className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-headline">Image Compressor</CardTitle>
                  <CardDescription className="mt-1">
                    Reduce file sizes of your images.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Optimize your PNG, JPG, GIF, or WEBP images by reducing their file size without significant quality loss. Perfect for web use and faster loading times.
              </p>
              <Link href="/tools/image-compressor" passHref>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Open Image Compressor
                </Button>
              </Link>
            </CardContent>
          </Card>
          {/* You can add more tool cards here in the future */}
          {/* Example:
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="bg-accent/20 p-3 rounded-lg">
                  <FileText className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-headline">Text Analyzer</CardTitle>
                  <CardDescription className="mt-1">
                    Analyze your text for insights.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Count words, characters, sentences, and get readability scores for your text content.
              </p>
              <Link href="/tools/text-analyzer" passHref>
                <Button className="w-full bg-primary hover:bg-primary/90" variant="outline">
                  Coming Soon
                </Button>
              </Link>
            </CardContent>
          </Card>
          */}
        </div>
      </section>

      <footer className="text-center py-10 mt-auto">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Toolify. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
