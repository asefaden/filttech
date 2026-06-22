<?php

namespace App\Filament\Resources\FeedBacks\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;

class FeedBacksTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                // image from user profile image
                ImageColumn::make('user.profile_image')
                    ->label('User Image')
                    ->circular(),
                TextColumn::make('user.name')
                    ->label('User Name')
                    ->searchable(),
                TextColumn::make('message')
                    ->searchable(),
                TextColumn::make('rating')
                    ->numeric()
                    ->sortable(),
                ToggleColumn::make('is_featured'),
                    
                
            ])
            ->filters([
                //
            ])
            ->recordActions([
                // EditAction::make(),
                ViewAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
