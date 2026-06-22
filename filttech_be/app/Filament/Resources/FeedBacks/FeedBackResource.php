<?php

namespace App\Filament\Resources\FeedBacks;

use App\Filament\Resources\FeedBacks\Pages\CreateFeedBack;
use App\Filament\Resources\FeedBacks\Pages\EditFeedBack;
use App\Filament\Resources\FeedBacks\Pages\ListFeedBacks;
use App\Filament\Resources\FeedBacks\Schemas\FeedBackForm;
use App\Filament\Resources\FeedBacks\Tables\FeedBacksTable;
use App\Models\FeedBack;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class FeedBackResource extends Resource
{
    protected static ?string $model = FeedBack::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedLightBulb;

    protected static ?string $recordTitleAttribute = 'Feedbacks';

    protected static ?int $navigationSort = 7;

    public static function form(Schema $schema): Schema
    {
        return FeedBackForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return FeedBacksTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListFeedBacks::route('/'),
            'create' => CreateFeedBack::route('/create'),
            'edit' => EditFeedBack::route('/{record}/edit'),
        ];
    }
}
