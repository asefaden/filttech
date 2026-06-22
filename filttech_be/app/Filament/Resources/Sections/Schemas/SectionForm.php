<?php

namespace App\Filament\Resources\Sections\Schemas;

use App\Models\Course;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class SectionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('course_id')
                    ->required()
                    ->options(fn () => Course::pluck('name', 'id')),
                TextInput::make('name')
                    ->required(),
                RichEditor::make('introduction')
                    ->columnSpanFull(),
                RichEditor::make('description')
                    ->columnSpanFull(),
                RichEditor::make('example')
                    ->columnSpanFull(),
                RichEditor::make('example_explanation')
                    ->columnSpanFull(),
                SpatieMediaLibraryFileUpload::make('thumbnail')
                    ->disk('public')
                    ->collection('thumbnail')
                    ->label('Thumbnail')
                    ->image()
                    ->columnSpanFull(),
                SpatieMediaLibraryFileUpload::make('video')
                    ->disk('public')
                    ->collection('video')
                    ->label('Video')
                    ->columnSpanFull(),
            ]);
    }
}
