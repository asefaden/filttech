<?php

namespace App\Filament\Resources\FeedBacks\Pages;

use App\Filament\Resources\FeedBacks\FeedBackResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListFeedBacks extends ListRecords
{
    protected static string $resource = FeedBackResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // CreateAction::make(),
        ];
    }
}
