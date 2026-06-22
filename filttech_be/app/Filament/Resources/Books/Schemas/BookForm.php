<?php

namespace App\Filament\Resources\Books\Schemas;

use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class BookForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('title')
                    ->required(),
                Textarea::make('description')
                    ->required(),
                SpatieMediaLibraryFileUpload::make('thumbnail')
                    ->disk('public')
                    ->collection('thumbnail')
                    ->label('Thumbnail')
                    ->columnSpanFull()
                    ->image(),
                SpatieMediaLibraryFileUpload::make('book_file')
                    ->disk('public')
                    ->collection('book_file')
                    ->acceptedFileTypes([
                        'application/pdf',
                        'application/epub+zip',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/rtf',
                        'text/plain',
                        '.mobi',
                        '.azw',
                        '.azw3',
                    ])
                    ->rules([
                        'required',
                        'file',
                        'mimetypes:application/pdf,application/epub+zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/rtf,text/plain',
                        'max:512000', // 500MB
                    ])
                    ->label('Book File')
                    ->helperText('Accepted formats: PDF, EPUB, MOBI, AZW, DOC, DOCX, RTF, TXT (Max 500MB)')
                    ->columnSpanFull(),
            ]);
    }
}
