<?php

namespace App\Filament\Resources\Sections\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class SectionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                SpatieMediaLibraryImageColumn::make('thumbnail')
                    ->label('Thumbnail')
                    ->collection('thumbnail')
                    ->circular(),
                TextColumn::make('course.name')
                    ->label('Course'),
                TextColumn::make('name')
                    ->searchable(),
                TextColumn::make('introduction')
                    ->searchable()
                    ->toggleable()
                    ->formatStateUsing(fn($state) => Str::limit(strip_tags($state), 150)),
                TextColumn::make('description')
                    ->searchable()
                    ->toggleable()
                    ->formatStateUsing(fn($state) => Str::limit(strip_tags($state), 150)),
                TextColumn::make('example')
                    ->searchable()
                    ->toggleable()
                    ->formatStateUsing(fn($state) => Str::limit(strip_tags($state), 150)),
                TextColumn::make('example_explanation')
                    ->searchable()
                    ->toggleable()
                    ->formatStateUsing(fn($state) => Str::limit(strip_tags($state), 150)),
                TextColumn::make('video')
                    ->label('Video')
                    ->formatStateUsing(function ($state, $record) {
                        return $record->getMedia('video')
                            ->map(fn($video) => "<a href='{$video->getUrl()}' target='_blank'>{$video->file_name}</a>")
                            ->join('<br>');
                    })
                    ->html()
                    ->toggleable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
