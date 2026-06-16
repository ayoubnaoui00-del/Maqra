import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useBookStore } from './store/useBookStore';
import BibliothequeScreen from './screens/BibliothequeScreen';

export default function App() {
  const books = useBookStore((s) => s.books);
  const addBook = useBookStore((s) => s.addBook);

  // Seed initial sample books for demonstration if empty
  useEffect(() => {
    if (books.length === 0) {
      addBook({
        title: 'مقدمة ابن خلدون',
        author: 'ابن خلدون',
        totalPages: 600,
        status: 'reading',
        currentPage: 150,
        genre: 'تاريخ',
        language: 'ar',
      });
      addBook({
        title: 'طوق الحمامة',
        author: 'ابن حزم الأندلسي',
        totalPages: 280,
        status: 'completed',
        currentPage: 280,
        genre: 'أدب وفلسفة',
        language: 'ar',
      });
      addBook({
        title: 'البؤساء',
        author: 'فيكتور هوجو',
        totalPages: 450,
        status: 'want_to_read',
        currentPage: 0,
        genre: 'رواية',
        language: 'ar',
      });
      addBook({
        title: 'Le Petit Prince',
        author: 'Antoine de Saint-Exupéry',
        totalPages: 110,
        status: 'paused',
        currentPage: 45,
        genre: 'قصة',
        language: 'fr',
      });
    }
  }, []);

  return (
    <BibliothequeScreen
      onSelectBook={(book) => {
        Alert.alert(
          'تفاصيل الكتاب',
          `العنوان: ${book.title}\nالمؤلف: ${book.author}\nالنوع: ${book.genre || 'غير محدد'}\nالتقدم: ${book.currentPage}/${book.totalPages} صفحة`
        );
      }}
      onGoToProfile={() => {
        Alert.alert('الملف الشخصي', 'ميزة الملف الشخصي قريباً!');
      }}
    />
  );
}

