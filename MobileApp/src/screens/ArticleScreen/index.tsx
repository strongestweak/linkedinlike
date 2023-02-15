import {RouteProp, useRoute} from '@react-navigation/native';
import {DateTime} from 'luxon';
import {Image, ScrollView, Text, View} from 'native-base';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {TouchableOpacity} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  FadeOutUp,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import RenderReact from '../../components/ArticleList/RenderReact';
import useArticleStore, {Article} from '../../stores/article';
import {User} from '../../stores/auth';
import useUserStore from '../../stores/user';
import {RootStackParamList, ROUTES, useNavigation} from '../../utils/types';
import UserRow from './UserRow';

export interface ArticleScreenParams {
  article: Article;
}
type ArticleRouteProp = RouteProp<RootStackParamList, ROUTES.ArticleScreen>;

/**
 * ArticleScreen props
 */
interface ArticleScreenProps {
  routes?: {params: ArticleScreenParams};
}

/**
 * ArticleScreen Component
 */
const ArticleScreen: FunctionComponent<ArticleScreenProps> = () => {
  const {userList} = useUserStore();
  const {article: articleStateList} = useArticleStore();
  const [isImageError, setIsImageError] = useState(false);
  const navigation = useNavigation();
  const {params} = useRoute<ArticleRouteProp>();
  const article = useMemo(
    () => articleStateList[params?.article?.id]?.data || params?.article,
    [articleStateList, params?.article],
  );

  const articleUser = useMemo(
    () => params?.article?.User,
    [params?.article?.User],
  );
  const {bottom} = useSafeAreaInsets();

  const formatDate = useCallback((date: Date): string => {
    if (!date) {
      return '';
    }
    return DateTime.fromJSDate(new Date(date)).toRelative() || '';
  }, []);

  const user = useMemo<User>(
    () => userList[articleUser.id]?.data || articleUser,
    [articleUser, userList],
  );

  useEffect(() => {
    // navigation.setOptions({title: article.title});
  }, [article, navigation]);

  const openUser = useCallback(() => {
    navigation.navigate(ROUTES.UserScreen, {user});
  }, [navigation, user]);

  const imageError = useCallback(() => setIsImageError(true), []);

  return (
    <ScrollView contentContainerStyle={{paddingBottom: bottom}}>
      <Animated.View entering={FadeInUp.delay(200)} exiting={FadeOutUp}>
        <View
          backgroundColor={'coolGray.700'}
          borderColor={'coolGray.900'}
          style={{width: '100%', aspectRatio: 300 / 200, borderWidth: 1}}>
          <Image
            alt=""
            source={{uri: article.thumbnail}}
            resizeMode="cover"
            style={{width: '100%', height: '100%'}}
            onError={imageError}
          />
          {isImageError ? (
            <Animated.View
              entering={FadeIn.delay(400)}
              exiting={FadeOut}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text>Image failed to load</Text>
            </Animated.View>
          ) : (
            <View />
          )}
        </View>
      </Animated.View>
      <View padding={3}>
        <Animated.View entering={FadeIn.delay(200)} exiting={FadeOut}>
          <Text fontSize={'2xl'}>{article.title}</Text>
        </Animated.View>
        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'flex-end',
          }}>
          <TouchableOpacity onPress={openUser}>
            <View marginTop={3}>
              <Text fontSize="xs" italic>
                Author
              </Text>
              <UserRow user={user} />
            </View>
          </TouchableOpacity>
          <View style={{alignItems: 'flex-end'}}>
            <Text fontSize="sm" italic>
              {formatDate(article.datePublished)}
            </Text>
            <RenderReact article={article} canUpdate />
          </View>
        </View>
        <Animated.View entering={FadeInDown.delay(200)} exiting={FadeOutDown}>
          <Text marginTop={3}>{article.description}</Text>
        </Animated.View>
      </View>
    </ScrollView>
  );
};

export default ArticleScreen;
