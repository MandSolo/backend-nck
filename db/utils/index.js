exports.userLookup = users => users.reduce((accUserObj, currentUser) => {
  accUserObj[currentUser.username] = currentUser.username;
  return accUserObj;
}, {});

exports.formatArticleData = (data, userLookup) => {
  const formattedArticleData = data.map(({ created_by, created_at, ...otherkeys }) => ({
    ...otherkeys,
    username: userLookup[created_by],
    created_at: new Date(created_at),
  }));
  return formattedArticleData;
};

exports.articleLookup = articles => articles.reduce((accArticleObj, currentArticle) => {
  accArticleObj[currentArticle.title] = currentArticle.article_id;
  return accArticleObj;
}, {});

exports.formatCommentData = (data, articleLookup, userLookup) => {
  const formattedCommentData = data.map(({
    created_at, created_by, belongs_to, ...otherkeys
  }) => ({
    ...otherkeys,
    username: userLookup[created_by],
    created_at: new Date(created_at),
    article_id: articleLookup[belongs_to],
  }));
  return formattedCommentData;
};
