<?php

namespace App\Filament\Resources\Posts\Schemas;

use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class PostForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('title')
                    ->required(),
                SpatieMediaLibraryFileUpload::make('thumbnail')
                    ->disk('public')
                    ->collection('thumbnail')
                    ->label('Thumbnail')
                    ->image()
                    ->columnSpanFull(),
                RichEditor::make('content')
                    ->required()
                    ->columnSpanFull(),
                Toggle::make('is_featured')
                    ->label('Featured Post')
                    ->default(false),

            ]);
    }
}
