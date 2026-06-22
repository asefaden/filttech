<?php

namespace App\Filament\Resources\FeedBacks\Schemas;

use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class FeedBackForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                RichEditor::make('message')
                    ->required()
                    ->columnSpanFull(),
                TextInput::make('rating')
                    ->required()
                    ->numeric()
                    ->columnSpanFull(),
                Toggle::make('is_featured')
                    ->label('Featured FeedBack')
                    ->default(false)
                    ->columnSpanFull(),
            ]);
    }
}
