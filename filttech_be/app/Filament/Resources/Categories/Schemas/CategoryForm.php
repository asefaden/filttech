<?php

namespace App\Filament\Resources\Categories\Schemas;

use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class CategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                SpatieMediaLibraryFileUpload::make('thumbnail')
                    ->disk('public')
                    ->collection('thumbnail')
                    ->label('Thumbnail')
                    ->image()
                    ->columnSpanFull(),
            ]);
    }
}
