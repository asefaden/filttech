<?php

namespace App\Filament\Resources\Users\Schemas;

use App\Models\Role;
use App\Models\User;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required()
                    ->label('Name'),
                TextInput::make('email')
                    ->email()
                    ->unique(
                        table: User::class,
                        column: 'email',
                        ignorable: fn($record) => $record
                    )
                    ->label('Email Address')
                    ->helperText('Email address must be unique'),
                TextInput::make('phone_number')
                    ->tel()
                    ->rules([
                        'starts_with:251',
                        'digits:12',
                    ])
                    ->unique(
                        table: User::class,
                        column: 'phone_number',
                        ignorable: fn($record) => $record
                    )
                    ->label('Phone Number')
                    ->helperText('Phone number must start with 251 and must be 12 digits'),
                Select::make('roles')
                    ->relationship('roles', 'name')
                    ->options(
                        Role::where('name', 'Expert')
                            ->where('guard_name', 'api')
                            ->pluck('name', 'uuid')
                    )
                    ->required()
                    ->multiple()
                    ->preload()
                    ->label('Roles'),
                TextInput::make('username')
                    ->unique(
                        table: User::class,
                        column: 'username',
                        ignorable: fn($record) => $record
                    )
                    ->label('Username')
                    ->helperText('Username must be unique'),
                TextInput::make('password')
                    ->password()
                    ->revealable()
                    ->dehydrated(fn($state) => filled($state) && $state !== 'create')
                    ->required(fn(string $context): bool => $context === 'create')
                    ->minLength(6)
                    ->same('passwordConfirmation')
                    ->label('Password'),
                TextInput::make('passwordConfirmation')
                    ->password()
                    ->revealable()
                    ->dehydrated(false)
                    ->required(fn(string $context): bool => $context === 'create')
                    ->minLength(6)
                    ->same('password')
                    ->label('Confirm Password'),
                Toggle::make('status')
                    ->required()
                    ->label('Status'),
                TextInput::make('profession')
                    ->label('Profession'),
                TagsInput::make('skills')
                    ->label('Skills')
                    ->placeholder('Add a skill')
                    ->separator(',')
                    ->columnSpanFull()
                    ->suggestions([
                        'Html',
                        'Css',
                        'Sql',
                        'JavaScript',
                    ]),
                SpatieMediaLibraryFileUpload::make('profile_image')
                    ->disk('public')
                    ->collection('profile_image')
                    ->label('Profile Image')
                    ->columnSpanFull()
                    ->image(),
            ]);
    }
}
