<?php

namespace App\Filament\Resources\FeedBacks\Pages;

use App\Filament\Resources\FeedBacks\FeedBackResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditFeedBack extends EditRecord
{
    protected static string $resource = FeedBackResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
