function(doc) 
{
  emit( ( new Date(doc.creation_date) ).getTime(), doc );
}