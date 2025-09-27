import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MarkdownLoader, ChapterData } from '../utils/markdownLoader';

export function ChapterPage() {
  const { chapter } = useParams<{ chapter: string }>();
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChapter = async () => {
      setLoading(true);
      if (chapter) {
        const data = await MarkdownLoader.loadChapter(chapter);
        setChapterData(data);
      }
      setLoading(false);
    };

    loadChapter();
  }, [chapter]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center">
        <div className="text-amber-800 dark:text-amber-50 font-serif text-xl">Loading chapter...</div>
      </div>
    );
  }

  if (!chapterData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center">
        <div className="text-amber-800 dark:text-amber-50 font-serif text-xl">Chapter not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-amber-700 dark:text-amber-50 hover:text-amber-900 font-serif"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Table of Contents</span>
          </Link>

          <div className="text-amber-600 dark:text-amber-50 font-serif text-sm">
            Pages {chapterData.pageNumbers}
          </div>
        </div>

        {/* Chapter Content */}
        <article className="bg-white rounded-lg shadow-xl border border-amber-200 overflow-hidden">
          {/* Chapter Header */}
          <header className="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-8">
            <div className="flex items-center space-x-4 mb-4">
              <BookOpen className="w-8 h-8 text-amber-200" />
              <div className="flex-1">
                <h1 className="text-3xl font-fantasy font-bold leading-tight">
                  {chapterData.title}
                </h1>
                {chapterData.subtitle && (
                  <p className="text-amber-200 font-serif italic mt-2">
                    {chapterData.subtitle}
                  </p>
                )}
              </div>
            </div>
          </header>

          {/* Chapter Body */}
          <div className="p-8 md:p-12">
            <div className="prose prose-amber max-w-none">
              <div
                className="chapter-content"
                dangerouslySetInnerHTML={{
                  __html: chapterData.content
                }}
              />
            </div>
          </div>
        </article>

        {/* Chapter Navigation */}
        <nav className="flex items-center justify-between mt-8">
          <div>
            {chapterData.prevChapter && (
              <Link
                to={`/chapter/${chapterData.prevChapter}`}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white hover:bg-amber-50 border border-amber-200 rounded-lg text-amber-800 dark:text-amber-50 font-serif transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Link>
            )}
          </div>

          <Link
            to="/"
            className="px-6 py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-serif transition-colors duration-200"
          >
            Contents
          </Link>

          <div>
            {chapterData.nextChapter && (
              <Link
                to={`/chapter/${chapterData.nextChapter}`}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white hover:bg-amber-50 border border-amber-200 rounded-lg text-amber-800 dark:text-amber-50 font-serif transition-colors duration-200"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}