<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Chapter;

class Subject extends Model
{
    use HasFactory, SoftDeletes;
    protected $dates = ['deleted_at'];

    protected $fillable = [
        'name',
        'description',
    ];

    public function chapters()
    {
        return $this->hasMany(Chapter::class, 'subject_id', 'id');
    }
}
