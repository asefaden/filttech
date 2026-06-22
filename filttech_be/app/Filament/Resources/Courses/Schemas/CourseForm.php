<?php

namespace App\Filament\Resources\Courses\Schemas;

use App\Models\Category;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Wizard;
use Filament\Schemas\Components\Wizard\Step;
use Filament\Schemas\Schema;

class CourseForm
{
    public static function configure(Schema $form): Schema
    {
        return $form
            ->schema([

                Wizard::make([
                    Step::make('Course Info')
                        ->schema([
                            Select::make('category_id')
                                ->required()
                                ->options(fn() => Category::pluck('name', 'id'))
                                ->preload(),

                            TextInput::make('name')
                                ->required(),

                            RichEditor::make('description')
                                ->columnSpanFull(),

                            SpatieMediaLibraryFileUpload::make('thumbnail')
                                ->disk('public')
                                ->collection('thumbnail')
                                ->label('Thumbnail')
                                ->columnSpanFull()
                                ->image()
                                ->preserveFilenames()
                                ->rules(['required', 'mimes:jpeg,png,jpg,gif,svg'])
                                ->helperText('Accepted formats: JPEG, PNG, JPG, GIF, SVG'),
                        ]),

                    Step::make('Sections')
                        ->schema([
                            Repeater::make('sections')
                                ->relationship() // auto-links to course_id
                                ->schema([
                                    TextInput::make('name')->required(),
                                    RichEditor::make('introduction'),
                                    RichEditor::make('description'),
                                    RichEditor::make('example'),
                                    RichEditor::make('example_explanation'),
                                    SpatieMediaLibraryFileUpload::make('thumbnail')
                                        ->disk('public')
                                        ->collection('thumbnail')
                                        ->label('Section Thumbnail')
                                        ->image()
                                        ->preserveFilenames()
                                        ->rules(['required', 'mimes:jpeg,png,jpg,gif,svg'])
                                        ->helperText('Accepted formats: JPEG, PNG, JPG, GIF, SVG'),

                                    SpatieMediaLibraryFileUpload::make('video')
                                        ->disk('public')
                                        ->collection('video')
                                        ->label('Section Video')
                                        ->preserveFilenames()
                                        ->rules(['required', 'mimetypes:video/mp4,video/quicktime,video/ogg,video/quicktime'])
                                        ->helperText('Accepted formats: MP4, MOV, OGG, QT'),
                                ])
                                ->createItemButtonLabel('Add Section')
                                ->columnSpanFull(),
                        ]),
                ])
                    ->columnSpanFull()

            ]);
    }
}
