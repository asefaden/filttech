<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $request ->validate([
            'per_page' => 'nullable|integer',
            'search' => 'nullable|string',
        ]);

        $books = Book::when($request->has('search'), function ($query) use ($request) {
            $query->where('title', 'like', "%{$request->search}%");
        })->latest()->paginate($request->per_page ?? 10);

        $formattedBooks = $books->map(function ($book) {
            return [
                'id' => $book->id,
                'title' => $book->title,
                'description' => $book->description,
                'thumbnail' => $book->thumbnail,
                'thumbnail_size' => $book->getFirstMedia('thumbnail') ? $book->getFirstMedia('thumbnail')->human_readable_size : null,
                'book_file' => $book->book_file,
                'book_file_size' => $book->getFirstMedia('book_file') ? $book->getFirstMedia('book_file')->human_readable_size : null,
            ];
        });

        return response()->json([
            'message' => 'Books',
            'data' => $formattedBooks,
            'pagination' => [
                'total' => $books->total(),
                'per_page' => $books->perPage(),
                'current_page' => $books->currentPage(),
                'last_page' => $books->lastPage(),
                'from' => $books->firstItem(),
                'to' => $books->lastItem(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $book = Book::create($validated);

        if ($request->hasFile('thumbnail')) {
            $book->addMedia($request->file('thumbnail'))->toMediaCollection('thumbnail');
        }

        if ($request->hasFile('book_file')) {
            $book->addMedia($request->file('book_file'))->toMediaCollection('book_file');
        }

        return response()->json($book, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Book $book)
    {
        $book = [
            'id' => $book->id,
            'title' => $book->title,
            'description' => $book->description,
            'thumbnail' => $book->thumbnail,
            'thumbnail_size' => $book->getFirstMedia('thumbnail') ? $book->getFirstMedia('thumbnail')->human_readable_size : null,
            'book_file' => $book->book_file,
            'book_file_size' => $book->getFirstMedia('book_file') ? $book->getFirstMedia('book_file')->human_readable_size : null,
        ];

        return response()->json($book);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Book $book)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $book->update($validated);

        if ($request->hasFile('thumbnail')) {
            $book->clearMediaCollection('thumbnail');
            $book->addMedia($request->file('thumbnail'))->toMediaCollection('thumbnail');
        }

        if ($request->hasFile('book_file')) {
            $book->clearMediaCollection('book_file');
            $book->addMedia($request->file('book_file'))->toMediaCollection('book_file');
        }

        return response()->json($book);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Book $book)
    {
        $book->delete();

        return response()->json(['message' => 'Book deleted successfully']);
    }
}
