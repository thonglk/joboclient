"use strict";

app.controller('sDashCtrl', function ($scope, $state, $http,$stateParams
    , CONFIG
    , AuthUser
    , $window
    , $log
    , $rootScope
    , toastr
    , $timeout
    , ModalService) {

    $rootScope.og = {
        title: '('+ $rootScope.newNoti +') Jobo' || 'Jobo'
    }

    $rootScope.$watch('onlineList', function (newvlue) {
        if (newvlue) {
            $rootScope.aside = true
        }
    })
    $scope.init = function () {
        if ($rootScope.userData && $rootScope.userData.location) {
            $scope.initData()
        } else {
            $scope.$on('handleBroadcast', function (event, message) {
                console.log('Init data', message);
                $scope.initData()
            });
        }
    };

    $scope.initData = function () {

        if (!$rootScope.userData) {
            toastr.info('Bạn cần cập nhật hồ sơ trước!')
            $state.go('profile')
        } else if (!$rootScope.userData.location) {
            toastr.info('Bạn hãy cập nhật địa chỉ để tìm việc xung quanh!')
            $state.go('profile')
            //init filter

        } else if (!$rootScope.newfilter) {
            $rootScope.newfilter = {
                userId: $rootScope.userId,
                type: 'job',
                p: 1,
                show:'new'
            }
            $scope.getUserFiltered($rootScope.newfilter)
        }

        if ($rootScope.newfilter && $rootScope.newfilter == 'job' && !$rootScope.jobCard) {
            $scope.getUserFiltered($rootScope.newfilter)
        }
        if ($rootScope.newfilter && $rootScope.newfilter == 'store' && !$rootScope.storeCard) {
            $scope.getUserFiltered($rootScope.newfilter)
        }


    }
    $scope.setSalary = function () {
        $scope.salary = true
    }

    $scope.salary = false
    $rootScope.newfilterFilter = function (type, key) {
        $rootScope.jobCard = []
        $rootScope.storeCard = []
        $rootScope.newfilter.p = 1
        $rootScope.newfilter[type] = key
        console.log($rootScope.newfilter)
        $scope.getUserFiltered($rootScope.newfilter)
        if (type == 'expect_salary') {
            $scope.salary = false
        }

    }

    $scope.sortFilter = function (param) {
        $rootScope.newfilter = {
            show: param
        }
        $scope.getUserFiltered($rootScope.newfilter)

    }


    $scope.selectFilter = function (card) {
        console.log('$rootScope.newfilter',$rootScope.newfilter)
        $rootScope.newfilter = card;
        $scope.getUserFiltered($rootScope.newfilter)
    };

    $rootScope.maxMatchJob = 0
    $rootScope.maxMatchStore = 0

    $scope.getUserFiltered = function (newfilter) {
        console.log('filtering..', newfilter)
        $scope.loading = true
        if (newfilter.type == 'store') {

            $http({
                method: 'GET',
                url: CONFIG.APIURL + '/api/employer',
                params: newfilter
            }).then(function successCallback(response) {
                console.log("response", response);
                $scope.response = response.data;
                if($rootScope.maxMatchStore == 0){
                    $rootScope.maxMatchStore = $scope.response.data[0].match
                    console.log($rootScope.maxMatchStore)
                }
                $timeout(function () {
                    if (!$rootScope.storeCard) {
                        $rootScope.storeCard = []
                    }
                    for (var i in $scope.response.data) {
                        var storeData = $scope.response.data[i]
                        $scope.response.data[i].matchPer = Math.round($scope.response.data[i].match *100/ $rootScope.maxMatchStore)


                        if (storeData.act) {
                            var ref = 'activity/like/' + storeData.storeId + ':' + $rootScope.userId
                            firebase.database().ref(ref).on('value', function (snap) {
                                $scope.response.data[i].act = snap.val()
                            })
                        }


                    }
                    $rootScope.storeCard = $rootScope.storeCard.concat($scope.response.data);
                    console.log($rootScope.storeCard)
                    $scope.loading = false

                })
            }, function (error) {
                console.log(error)

                $scope.loading = false

            })


        } else {
            $http({
                method: 'GET',
                url: CONFIG.APIURL + '/api/job',
                params: newfilter
            }).then(function successCallback(response) {
                console.log("respond", response);
                $scope.response = response.data;
                if($rootScope.maxMatchJob == 0){
                    $rootScope.maxMatchJob = $scope.response.data[0].match
                    console.log($rootScope.maxMatchJob)
                }
                $timeout(function () {
                    if (!$rootScope.jobCard) {
                        $rootScope.jobCard = []
                    }
                    for (var i in $scope.response.data) {


                        var jobData = $scope.response.data[i]
                        $scope.response.data[i].matchPer = Math.round($scope.response.data[i].match *100/ $rootScope.maxMatchJob)

                        if (jobData.act) {
                            var ref = 'activity/like/' + jobData.storeId + ':' + $rootScope.userId
                            firebase.database().ref(ref).on('value', function (snap) {
                                $scope.response.data[i].act = snap.val()
                            })
                        }
                    }
                    $rootScope.jobCard = $rootScope.jobCard.concat($scope.response.data);
                    console.log($rootScope.jobCard)
                    $scope.loading = false
                })
            }, function (error) {
                console.log(error)

                $scope.loading = false

            })

        }


    };


    $scope.slideHasChanged = function (index) {
        console.log('slideHasChanged');
        $scope.slideIndex = index
    };

    $scope.slideTo = function (index) {
        $ionicSlideBoxDelegate.slide(index);
    };
    $scope.deviceHeight = window.innerHeight;

    $scope.slideIndex = 1;
// to logout


    $scope.matchlike = "";

    if (!$rootScope.userliked) {
        $rootScope.userliked = [];
    }
    if (!$rootScope.userdisliked) {
        $rootScope.userdisliked = [];
    }

    $scope.filterSearchMook = function () {
        console.log($rootScope.newfilter)
    }
    $scope.applyThis = function (id, key) {
        if ($scope.selectedJob && $scope.selectedJob[id] && $scope.selectedJob[id][key]) {
            delete $scope.selectedJob[id][key]
        } else {

            if (!$scope.selectedJob) {
                $scope.selectedJob = {}
            }
            if (!$scope.selectedJob[id]) {
                $scope.selectedJob[id] = {}
            }
            $scope.selectedJob[id][key] = true;
        }
        console.log($scope.selectedJob)
    };


    $scope.like = function (card, action, selectedJob) {

        AuthUser.userLike(card, action, selectedJob).then(function (result) {
            console.log(result)

        })
    };

    $scope.chatto = function (id) {
        $state.go("employer.chats", {to: id})
    };

    $scope.limit = 5;
    $scope.showMore = function () {
        console.log('reach')
        $rootScope.newfilter.p++
        $scope.getUserFiltered($rootScope.newfilter)

    }
    $scope.loading = false;
    $scope.loadMoreStore = function () {
        if ($scope.newfilter && $scope.response && $scope.newfilter.type == 'store') {
            console.log('request load', $scope.newfilter.p, $scope.response.total_pages)
            if (!$scope.loading && $scope.newfilter) {
                if ($scope.newfilter.p < $scope.response.total_pages) {
                    $scope.loading = true;
                    console.log('loading')

                    $scope.newfilter.p++
                    $scope.getUserFiltered($scope.newfilter);
                    $timeout(function () {
                        $scope.loading = false;
                    }, 500)
                } else {
                    console.log('max page')
                }

            }
        }

    }
    $scope.loadMoreJob = function () {
        if ($scope.newfilter && $scope.response && $scope.newfilter.type == 'job') {
            console.log('request load', $scope.newfilter.p, $scope.response.total_pages)
            if (!$scope.loading && $scope.newfilter) {
                if ($scope.newfilter.p < $scope.response.total_pages) {
                    $scope.loading = true;
                    console.log('loading')

                    $scope.newfilter.p++
                    $scope.getUserFiltered($scope.newfilter);
                    $timeout(function () {
                        $scope.loading = false;
                    }, 500)
                } else {
                    console.log('max page')
                }

            }
        }

    }


});

$(window).scroll(function() {
    var scroll = $(window).scrollTop();

    if (scroll >= 300) {
        $(".filter-tab").addClass("fixed-top").css({top: 60, 'z-index': 1});
    } else {
        $(".filter-tab").removeClass("fixed-top").css({top: 0});
    }
});
"use strict";

app.controller('sprofileCtrl', sprofileCtrl).filter('propsFilter', propsFilter);

function sprofileCtrl(debounce, $rootScope, $scope, AuthUser, $stateParams, $timeout, $state, toastr, $http, firebase, Upload, usSpinnerService, $sce, $anchorScroll, $location) {
    $scope.startSpin = function (spin) {
        usSpinnerService.spin(spin);
    };
    $scope.stopSpin = function (spin) {
        usSpinnerService.stop(spin);
    };
    $scope.init = function () {
        $scope.progress = 0

        $scope.multiple = {
            industry: [],
            languages: [],
            time: [],
            job: []
        };

        $scope.picFile = null;
        $scope.indexToShow = 0;
        AuthUser.user()
            .then(function (userInfo) {
                $scope.userInfo = userInfo
                $timeout(function () {
                    if (!$rootScope.userData) {
                        //chưa có hồ sơ
                        $scope.firsttime = true
                        $rootScope.userData = {
                            userId: $rootScope.userId,
                            name: userInfo.name,
                            photo: []
                        }
                    }
                    if ($rootScope.userData.email && $rootScope.userData.phone) {
                        $scope.indexToShow = 1;
                        if ($rootScope.userData.name && $rootScope.userData.birthArray && $rootScope.userData.address && $rootScope.userData.job) {
                            $scope.indexToShow = 2;
                        }
                    }

                    if ($rootScope.userData.school) {
                        $scope.autocompleteSchool = {text: $rootScope.userData.school}
                    }
                    if ($rootScope.userData.address) {
                        $scope.autocompleteAddress = {text: $rootScope.userData.address}
                    }

                    if ($rootScope.userData.industry) {
                        for (var i in $rootScope.userData.industry) {
                            $scope.multiple.industry.push(i)
                        }
                    }
                    if ($rootScope.userData.languages) {
                        for (var i in $rootScope.userData.languages) {
                            $scope.multiple.languages.push(i)
                        }
                    }

                    if ($rootScope.userData.job) {
                        for (var i in $rootScope.userData.job) {
                            $scope.multiple.job.push(i)
                        }
                    }
                    if ($rootScope.userData.birth) {
                        $rootScope.userData.birthArray = $rootScope.service.convertDateArray($rootScope.userData.birth)
                        console.log('$rootScope.userData.birthArray', $rootScope.userData.birthArray)
                    }

                    if (!$rootScope.userData.photo) {
                        $rootScope.userData.photo = []
                    }

                    $scope.videoTrusted = $sce.trustAsResourceUrl($rootScope.userData.videourl)
                })

            }, function (error) {
                console.log(error)
                // error
            });
    }
    var admin = $stateParams.admin
    $scope.admin = $stateParams.admin;
    if (admin && $rootScope.type !== 0) {
        $scope.indexToShow = 2;
        AuthUser.user().then(function (adminInfo) {
            $scope.adminData = adminInfo;
            console.log('adminData ', $scope.adminData);
            if ($scope.adminData.admin) {
                $rootScope.userId = admin;

                $scope.progress = 0;

                $scope.multiple = {
                    industry: [],
                    languages: [],
                    time: [],
                    job: []
                };

                $scope.picFile = null;

                $rootScope.service.JoboApi('initData', {userId: $rootScope.userId}).then(function (data) {
                    $rootScope.userData = data.data.userData;
                    console.log('$rootScope.userData: ', $rootScope.userData);
                    $timeout(function () {
                        if (!$rootScope.userData) {
                            //chưa có hồ sơ
                            $scope.firsttime = true
                            $rootScope.userData = {
                                userId: $rootScope.userId,
                                name: userInfo.name,
                                photo: []
                            }
                        }

                        if ($rootScope.userData.school) {
                            $scope.autocompleteSchool = {text: $rootScope.userData.school}
                        }
                        if ($rootScope.userData.address) {
                            $scope.autocompleteAddress = {text: $rootScope.userData.address}
                        }

                        if ($rootScope.userData.industry) {
                            for (var i in $rootScope.userData.industry) {
                                $scope.multiple.industry.push(i)
                            }
                        }
                        if ($rootScope.userData.languages) {
                            for (var i in $rootScope.userData.languages) {
                                $scope.multiple.languages.push(i)
                            }
                        }

                        if ($rootScope.userData.job) {
                            for (var i in $rootScope.userData.job) {
                                $scope.multiple.job.push(i)
                            }
                        }
                        if ($rootScope.userData.birth) {
                            $rootScope.userData.birthArray = $rootScope.service.convertDateArray($rootScope.userData.birth)
                            console.log('$rootScope.userData.birthArray', $rootScope.userData.birthArray)
                        }

                        if (!$rootScope.userData.photo) {
                            $rootScope.userData.photo = []
                        }

                        $scope.videoTrusted = $sce.trustAsResourceUrl($rootScope.userData.videourl)
                    })

                })
            }
        });
    } else {
        $scope.init()
    }

    $scope.rangeFinishCallback = function (sliderObj) {
        var newValue = sliderObj.from;
        console.log(newValue)

        if ($scope.userData) {
            $scope.userData.expect_distance = newValue
        }
    }
    $scope.uploadAvatar = function (imageData, errFiles) {
        $scope.avatarUpload = true
        $scope.startSpin('avatar');

        var uploadRef = firebase.storage().ref().child('images/' + $rootScope.userId)
        uploadRef.putString(imageData, 'data_url').then(function (snapshot) {
            if ($scope.avatarUpload == true) {
                console.log('Uploaded a base64 string!', snapshot);
                var downloadAvatar = snapshot.downloadURL;
                console.log(downloadAvatar);
                $rootScope.userData.avatar = downloadAvatar;
                $scope.$apply(function () {
                    $scope.stopSpin('avatar');
                    delete $scope.picFile;
                    downloadAvatar = null;
                    $scope.avatarUpload = false
                })
            }

        });


    };

    $scope.options = ['FBMessenger', 'Skype', 'Zalo', 'Facetime'];


    $scope.uploadVideo = function (imageData) {
        $scope.startSpin('video');
        $scope.videoUpload = true

        console.log('imageData', imageData)
        var metadata = {
            'contentType': imageData.type
        };
        var storageRef = firebase.storage().ref();
        var uploadTask = storageRef.child('video/' + $rootScope.userId).put(imageData, metadata);
        uploadTask.then(function (snapVideo) {
            if ($scope.videoUpload == true) {
                var downloadVideo = snapVideo.downloadURL;
                console.log(downloadVideo);
                $timeout(function () {
                    $rootScope.userData.videourl = downloadVideo;
                    $scope.videoTrusted = $sce.trustAsResourceUrl($rootScope.userData.videourl)
                    $scope.$apply(function () {
                        $scope.stopSpin('video');
                        downloadVideo = null
                    })

                })

                $scope.videoUpload = false
            }
        })
        uploadTask.on('state_changed', function (snapVideo) {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded

            var progress = (snapVideo.bytesTransferred / snapVideo.totalBytes) * 100;
            $timeout(function () {
                $scope.progress = Math.round(progress * 10) / 10

            });
            $scope.progress = progress

            console.log('Upload is ' + progress + '% done');

            switch (snapVideo.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                    console.log('Upload is paused');
                    break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                    console.log('Upload is running');
                    break;
            }
        }, function (error) {
            // Handle unsuccessful uploads
        }, function () {
            // Handle successful uploads on complete

        });
    };

    //school
    $scope.autocompleteSchool = {text: ''};
    $scope.searchSchool = function () {
        var params = {
            query: S($scope.autocompleteSchool.text).latinise().s,
            type: 'university'
        };
        $http({
            method: 'GET',
            url: $rootScope.CONFIG.APIURL + '/api/places',
            params: params
        }).then(function successCallback(response) {
            $scope.ketquasSchool = response.data.results;
            console.log($scope.ketquasSchool);
            $('#list-school').show();
        })
    };

    $scope.setSelectedSchool = function (selected) {
        $scope.school = selected;
        console.log($scope.school)
        $scope.autocompleteSchool.text = $scope.school.name
        $rootScope.userData.school = $scope.school.name
        $('#list-school').hide();

    };

    $scope.eraseSchool = function () {
        $scope.autocompleteSchool.text = null;
        $('#list-school').hide();
    }
    //address
    // var delay = false;
    $scope.autocompleteAddress = {text: ''};
    $scope.ketquasAddress = [];
    $scope.searchAddress = function (textfull) {
        var text = S(textfull).latinise().s
        $scope.URL = 'https://maps.google.com/maps/api/geocode/json?address=' + text;
        /*if (delay == false) {
         delay = true
         $http({
         method: 'GET',
         url: $scope.URL
         }).then(function successCallback(response) {
         $scope.ketquasAddress = response.data.results;
         console.log($scope.ketquasAddress);
         $('#list-add').show();
         })
         $timeout(function () {
         delay = false
         }, 1000)
         }*/
        $http({
            method: 'GET',
            url: $scope.URL
        }).then(function successCallback(response) {
            $scope.ketquasAddress = response.data.results;
            console.log($scope.ketquasAddress);
            $('#list-add').show();
        })
    };
    $scope.setSelectedAddress = function (selected) {
        $scope.autocompleteAddress.text = selected.formatted_address;
        $scope.address = selected;
        $rootScope.userData.address = selected.formatted_address;
        $rootScope.userData.location = selected.geometry.location;

        console.log(selected);
        $('#list-add').hide();
        //$rootScope.userData.address = selected.formatted_address;
        //$rootScope.userData.location = selected.geometry.location;

    };
    $scope.eraseAddress = function () {
        $scope.autocompleteAddress.text = null;
        $('#list-add').hide();
    };
    $scope.deleteExp = function (id) {
        delete  $scope.userData.experience[id]
    };

    $scope.addMoreExp = function () {
        $scope.tempoExperience = {}
    };
    $scope.saveJob = function () {
        // var experienceRef = firebase.database().ref('profile/' + $rootScope.userId + '/experience');
        // var newkey = experienceRef.push().key;
        var newkey = 'p' + Math.round(100000000000000 * Math.random());
        $scope.tempoExperience.id = newkey
        if (!$scope.userData.experience) {
            $scope.userData.experience = {}
        }
        $scope.userData.experience[newkey] = $scope.tempoExperience
        delete $scope.tempoExperience
    };
    //admin note
    $scope.addMoreNote = function () {
        $scope.tempoAdminNote = {};
        $scope.tempoAdminNote.date = new Date();
        $scope.tempoAdminNote.adminId = $scope.adminData.userId;
    };
    $scope.deleteNote = function (id) {
        delete $scope.userData.adminNote[id]
    };
    $scope.deleteTempNote = function () {
        delete $scope.tempoAdminNote
    }
    $scope.saveNote = function () {

        var newkey = 'p' + Math.round(100000000000000 * Math.random());
        $scope.tempoAdminNote.id = newkey;
        if (!$scope.userData.adminNote) {
            $scope.userData.adminNote = {}
        }
        $scope.userData.adminNote[newkey] = $scope.tempoAdminNote;
    };
    //update data
    $scope.updateData = function () {
        $scope.error = {};
        var dataUser = {};
        if ($scope.indexToShow === 0) {
            console.log('Update phone and email');
            if ($rootScope.userData && $rootScope.userData.email && $rootScope.userData.phone) {
                console.log($rootScope.userData.phone);
                console.log($rootScope.userData.email);
                dataUser.user = {
                    phone: $rootScope.userData.phone,
                    email: $rootScope.userData.email
                };
                $rootScope.service.JoboApi('update/user', {
                    userId: $rootScope.userId,
                    user: dataUser.user
                });
                $scope.indexToShow++;
                console.log($scope.indexToShow);
                $rootScope.service.Ana('Update phone and email');
                $scope.gotoAnchor('name');
            } else {
                if (!$rootScope.userData.email) {
                    $scope.error.email = true;
                }
                if (!$rootScope.userData.phone) {
                    $scope.error.phone = true;
                }
            }
        } else if ($scope.indexToShow === 1) {
            console.log('Update User Profile');
            if ($rootScope.userData.email
                && $rootScope.userData.phone
                && $rootScope.userData.address
                && $rootScope.userData.name
                && $rootScope.userData.birthArray
                && $scope.multiple.job.length > 0) {

                $rootScope.userData.name = $rootScope.service.upperName($rootScope.userData.name);
                $rootScope.userData.birth = $rootScope.service.convertDate($rootScope.userData.birthArray);
                $rootScope.userData.createdAt = new Date().getTime()

                console.log($rootScope.userData);
                $timeout(function () {
                    // console.log($scope.multiple);
                    if ($scope.multiple.job.length >= 0) {
                        $rootScope.userData.job = {};
                        angular.forEach($scope.multiple.job, function (card) {
                            $rootScope.userData.job[card] = true
                        })
                    }
                    console.log($rootScope.userData);

                    dataUser.user = {
                        phone: $rootScope.userData.phone,
                        email: $rootScope.userData.email,
                        name: $rootScope.userData.name
                    };
                    dataUser.profile = {
                        userId: $rootScope.userData.userId,
                        name: $rootScope.userData.name,
                        birth: $rootScope.userData.birth,
                        birthArray: $rootScope.userData.birthArray,
                        address: $rootScope.userData.address,
                        location: $rootScope.userData.location,
                        job: $rootScope.userData.job,
                        avatar: $rootScope.userData.avatar,
                        createAt: $rootScope.userData.createAt

                    };
                    $rootScope.service.JoboApi('update/user', {

                        userId: $rootScope.userId,
                        user: dataUser.user,
                        profile: dataUser.profile
                    });

                    console.log('Update User Profile Complete');

                }, 1000);
                $rootScope.service.Ana('Update user profile');
                $scope.indexToShow++;
                console.log($scope.indexToShow);
                $scope.gotoAnchor('info');
            } else {
                if (!$rootScope.userData.name) {
                    $scope.error.name = true;
                }
                if (!$rootScope.userData.birthArray) {
                    $scope.error.birth = true;
                }
                if (!$rootScope.userData.email) {
                    $scope.error.email = true;
                }
                if (!$rootScope.userData.phone) {
                    $scope.error.phone = true;
                }
                if (!$rootScope.userData.address) {
                    $scope.error.address = true;
                }
                if ($scope.multiple.job.length === 0) {
                    $scope.error.job = true;
                }
            }
        }
    };
    //upload more image
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    $scope.$watch('file', function () {
        if ($scope.file != null) {
            $scope.files = [$scope.file];
        }
    });
    $scope.log = {};
    $scope.deleteImage = function (images) {
        console.log('clicked', images)
        $scope.userData.photo.splice(images, 1);
    };
    //delete video
    $scope.deleteVideo = function () {
        if (confirm("Bạn muốn xoá video?") === true) {
            console.log('videoURL undelete', $rootScope.userData.videourl);
            $rootScope.service.JoboApi('delete/video', {
                userId: $rootScope.userId,
                videoURL: $rootScope.userData.videourl
            });
            delete $rootScope.userData.videourl;
            console.log('videoURL deleted', $rootScope.userData.videourl);
        }
    };
    $scope.upload = function (files) {
        $scope.uploadPhoto = true
        $scope.startSpin('photo');

        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                console.log(i)
                var file = files[i];
                console.log(file)

                if (!file.$error) {

                    var metadata = {
                        'contentType': file.type
                    };
                    var storageRef = firebase.storage().ref();
                    // var newkey = firebase.database().ref('profile/' + $rootScope.userId + '/photo').push().key;
                    var newkey = 'p' + Math.round(100000000000000 * Math.random());
                    var uploadTask = storageRef.child('images/' + newkey).put(file, metadata);

                    uploadTask.then(function (snapshot) {
                        if ($scope.uploadPhoto == true) {
                            var downloadPhoto = snapshot.downloadURL;
                            console.log(downloadPhoto);

                            $rootScope.userData.photo.push(downloadPhoto);
                            console.log($rootScope.userData.photo)
                        }
                    });

                    uploadTask.on('state_changed', function (snapshot) {
                        $timeout(function () {
                                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                $scope.log[i] = progress + '%';
                                console.log('Upload is ' + progress + '% done');
                            }
                        );
                        // Observe state change events such as progress, pause, and resume
                    }, function (error) {
                        // Handle unsuccessful uploads
                    }, function () {
                        // Handle successful uploads on complete
                        // For instance, get the download URL: https://firebasestorage.googleapis.com/...


                        $scope.stopSpin('photo')
                    })

                }
            }
        }
    };

    $scope.submit = function () {
        console.log('$rootScope.userData', $rootScope.userData)
        if (($rootScope.userData.email
                && $rootScope.userData.phone
                && $rootScope.userData.address
                && $rootScope.userData.name
                && $rootScope.userData.birthArray
                && $scope.multiple.job.length > 0) || ($stateParams.admin)) {
            $rootScope.userData.name = $rootScope.service.upperName($rootScope.userData.name)
            $rootScope.userData.birth = $rootScope.service.convertDate($rootScope.userData.birthArray);
            console.log($rootScope.userData);

            $timeout(function () {
                console.log($scope.multiple)
                if ($scope.multiple.industry.length >= 0) {
                    $rootScope.userData.industry = {};
                    angular.forEach($scope.multiple.industry, function (card) {
                        $rootScope.userData.industry[card] = true
                    })
                }
                if ($scope.multiple.job.length >= 0) {
                    $rootScope.userData.job = {};
                    angular.forEach($scope.multiple.job, function (card) {
                        $rootScope.userData.job[card] = true
                    })
                }

                if ($scope.multiple.languages.length >= 0) {
                    $rootScope.userData.languages = {};
                    angular.forEach($scope.multiple.languages, function (card) {
                        $rootScope.userData.languages[card] = true
                    })
                }

                $rootScope.userData.userId = $rootScope.userId;
                console.log($rootScope.userData);

                var dataUser = {
                    name: $rootScope.userData.name,
                    phone: $rootScope.userData.phone,
                    email: $rootScope.userData.email
                };
                if ($rootScope.userData.wrongEmail) {
                    dataUser.wrongEmail = $rootScope.userData.wrongEmail
                }
                var dataProfile = $rootScope.userData
                delete dataProfile.phone
                delete dataProfile.email
                delete dataProfile.webToken
                delete dataProfile.ref
                delete dataProfile.provider
                delete dataProfile.type
                delete dataProfile.mobileToken
                delete dataProfile.wrongEmail
                delete dataProfile.adminData
                delete dataProfile.act
                delete dataProfile.distance


                console.log(dataProfile)

                $rootScope.service.JoboApi('update/user', {
                    userId: $rootScope.userId,
                    user: dataUser,
                    profile: dataProfile
                }).then(function (res) {
                    if ($scope.firsttime) {
                        $rootScope.service.Ana('createProfile');
                    } else {
                        $rootScope.service.Ana('updateProfile');
                    }

                    if (!$rootScope.userData.avatar) {
                        toastr.info('Bạn cần cập nhật avatar thì thông tin của bạn mới được hiện thị cho nhà tuyển dụng, hãy cập nhật ngay!');

                    }
                    toastr.success('Cập nhật hồ sơ thành công');
                    if ($rootScope.preApply) {
                        $rootScope.service.userLike($rootScope.preApply.card, 0, $rootScope.preApply.jobOffer)
                    }
                    if ($scope.adminData && $scope.adminData.admin) {
                        console.log('adminData.admin');
                        $timeout(function () {
                            window.location.href = "/view/profile/" + $rootScope.userId;
                        });
                    } else {
                        $state.go('app.sdash', {}, {reload: true})
                    }
                });


                //init profile

                // $state.go('app.sdash', {}, {reload: true})
            }, 1000)
        } else {
            console.log($rootScope.userData);
            $scope.error = {};
            if ($rootScope.userData.name) {

            } else {
                $scope.error.name = true;
                $timeout(function () {
                    console.log($scope.error)
                })
            }
            if ($rootScope.userData.birthArray) {

            } else {
                $scope.error.birth = true;
                $timeout(function () {
                    console.log($scope.error)
                })
            }
            if ($rootScope.userData.email) {

            } else {
                $scope.error.email = true;
                $timeout(function () {
                    console.log($scope.error)
                })
            }
            if ($rootScope.userData.phone) {

            } else {
                $scope.error.phone = true;
                $timeout(function () {
                    console.log($scope.error)
                })
            }
            if ($rootScope.userData.address) {

            } else {
                $scope.error.address = true;
                $timeout(function () {
                    console.log($scope.error)
                })
            }
            if ($scope.multiple.job.length > 0) {
            } else {
                $scope.error.job = true;
                $timeout(function () {
                    console.log($scope.error)
                })
            }
            if ($rootScope.userData.avatar) {

            } else {
                $scope.error.avatar = true;
                $timeout(function () {
                    console.log($scope.error)
                })
            }

            toastr.error('Bạn chưa cập nhật đủ thông tin', 'Lỗi');
            $scope.gotoAnchor('name')
        }
    };

    $scope.gotoAnchor = function (x) {
        var newHash = 'anchor' + x;
        if ($location.hash() !== newHash) {
            // set the $location.hash to `newHash` and
            // $anchorScroll will automatically scroll to it
            $location.hash('anchor' + x);
        } else {
            // call $anchorScroll() explicitly,
            // since $location.hash hasn't changed
            $anchorScroll();
        }
    };

}

function propsFilter() {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function (item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    }
}

"use strict";

app.controller("ViewStoreCtrl", function ($scope, $stateParams, $sce, $rootScope, $http, CONFIG, $timeout, $state) {
    $rootScope.aside = false

    $scope.profileId = $stateParams.id;
    $scope.currentJob = $stateParams.job;


    $scope.admin = $stateParams.admin;

    console.log('admin', $scope.admin)

    $rootScope.service.Ana('viewStore', {storeId: $scope.profileId})
    if ($scope.profileId) {
        loadStore($scope.profileId)
        init($scope.profileId, $rootScope.userId)

        if (!$rootScope.userId) {
            $rootScope.$on('handleBroadcast', function (event, userData) {
                init($scope.profileId, userData.userId)
                loadStore($scope.profileId)
            });
        }
    }

    function loadStore(profileId) {

        $http({
            method: 'GET',
            url: CONFIG.APIURL + '/view/store',
            params: {storeId: $scope.profileId, userId: $rootScope.userId}
        }).then(function successCallback(response) {
            console.log("respond", response);
            $scope.profileData = response.data;
            $scope.jobData = $scope.profileData.jobData;

            $scope.profileData.background = '/img/ava-background/background_' + $scope.profileData.industry + '.png';
            if ($scope.currentJob) {
                $timeout(function () {
                    $scope.currentJobData = $scope.profileData.job[$scope.currentJob]
                })
            }

            $scope.adminData = $scope.profileData.adminData
            $scope.listReact = $scope.profileData.actData
            $scope.staticData = $scope.profileData.static
            $scope.limit = {like: 10, liked: 10, match: 10}
            $scope.reviewData = $scope.profileData.review
            if ($scope.reviewData) {
                $timeout(function () {
                    $scope.ratingModel = $rootScope.service.calReview($scope.reviewData);
                    console.log($scope.ratingModel)
                })
            }
            if ($scope.profileData.storeList) {
                $scope.storeList = $scope.profileData.storeList
                $scope.numberStore = Object.keys($scope.storeList).length
            }

            $scope.incrementLimit = function (type) {
                $scope.limit[type] = $scope.listReact[type].length
            }
            // for share
            var profileJobtake = "";
            for (var i in $scope.profileData.job) {
                var job = $scope.profileData.job[i]
                if (job.job != 'other') {
                    profileJobtake += job.job + ", "
                }
            }
            var profileJob = profileJobtake.slice(0, profileJobtake.length - 2)
            console.log(profileJob);
            $scope.share = {
                Url: "web.joboapp.com/view/profile/" + profileId,
                Text: $scope.profileData.storeName + ' tuyển dụng',
                Title: $scope.profileData.industry + ' ' + $scope.profileData.name,
                Description: 'Xem tin tuyển dụng với vị trí' + profileJob + 'của' + $scope.profileData.storeName,
                Type: 'feed',
                Media: $scope.profileData.avatar,
                Via: '295208480879128',
                Hashtags: 'jobo,timviecnhanh,pg,sale,model',
                Caption: 'Có ai muốn làm ' + profileJob + ' không nhỉ? Mình vừa mới tìm thấy tin tuyển dụng này, thử vào Jobo xem thông tin chi tiết rồi cho mình biết bạn nghĩ sao nhé ;) #jobo #timviecnhanh #pg #sale #model'
            }
            $rootScope.og = {
                title: $scope.profileData.storeName + ' tuyển dụng',
                description: 'Xem tin tuyển dụng với vị trí' + profileJob + 'của' + $scope.profileData.storeName,
                image: $scope.profileData.avatar
            }
        })

    }


    function init(profileId, userId) {
        if (profileId == $rootScope.storeId) {
            $timeout(function () {
                $scope.myself = true
            })
        }

    }

    $scope.indexCurrent = 0;
    if ($rootScope.usercard) {
        for (var i in $rootScope.usercard) {
            if ($rootScope.usercard[i].userId == $scope.profileId) {
                $scope.indexCurrent = i;
                console.log($scope.indexCurrent)
                break
            }
        }
    }

    $scope.rating = 3;
    $scope.rateFunction = function (rating) {
        $scope.reviews = {
            name: $rootScope.userData.name,
            avatar: $rootScope.userData.avatar || "",
            userId: $rootScope.userId,
            rate: rating,
            type: $rootScope.type,
            createdAt: new Date().getTime(),
            profileId: $scope.profileId

        }
        console.log('Rating selected: ' + rating);
    };
    $scope.review = function (reviews) {
        $rootScope.service.JoboApi('update/review', {
            reviews: reviews
        });
    }


    $scope.$back = function () {
        window.history.back();
    };
    $scope.showVideo = function (user) {
        $scope.showVid = true
        $scope.videoTrusted = $sce.trustAsResourceUrl(user.videourl)
    }
    $scope.hideVideo = function () {
        delete $scope.showVid

    }
    $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
    };

    $scope.nextProfile = function () {
        var next = +$scope.indexCurrent + +1
        console.log(next)
        var nextUserId = $rootScope.storeCard[next].userId
        $state.go('employer.viewprofile', {id: nextUserId})
    }
    $scope.backProfile = function () {
        var back = +$scope.indexCurrent - +1
        console.log(back)
        var backUserId = $rootScope.storeCard[back].userId
        $state.go('employer.viewprofile', {id: backUserId})
    }


    $scope.applyThis = function (id, key) {
        if ($scope.selectedJob && $scope.selectedJob[id] && $scope.selectedJob[id][key]) {
            delete $scope.selectedJob[id][key]
            console.log($scope.selectedJob)
        } else {

            if (!$scope.selectedJob) {
                $scope.selectedJob = {}
            }
            if (!$scope.selectedJob[id]) {
                $scope.selectedJob[id] = {}
            }
            $scope.selectedJob[id][key] = true;
            console.log($scope.selectedJob)

        }
    };


    $scope.shortAddress = function (fullAddress) {
        if (fullAddress) {
            var mixAddress = fullAddress.split(",");
            var address = mixAddress[0] + ', ' + mixAddress[1] + ', ' + mixAddress[2];
            return address
        }

    }

    $scope.like = function (card, action, selectedJob) {
        $rootScope.service.userLike(card, action, selectedJob).then(function (result) {
            console.log(result)
        })
    };

    $scope.chatto = function (id) {
        $state.go("employer.chats", {to: id, slide: 1})
    };

});

"use strict";

app.controller('eDashCtrl', function ($scope, $state, $http, $sce, toastr, $q
    , CONFIG
    , AuthUser
    , $window
    , $log
    , $rootScope
    , $timeout
    , ModalService) {

    $rootScope.$watch('newNoti', function (newNoti) {
        $rootScope.og = {
            title: '(' + newNoti + ') Jobo' || 'Jobo'
        }
    });

    $(document).ready(function () {
        $('[data-toggle="popover"]').popover();
    });
    $rootScope.$watch('onlineList', function (newvlue) {
        if (newvlue) {
            $rootScope.aside = true
        }
    });
    $scope.init = function () {

        if ($rootScope.storeData) {
            $scope.initData($rootScope.storeData)

        } else {
            $scope.$on('handleBroadcast', function (event, storeData) {
                $scope.initData($rootScope.storeData)
            });
        }

    };
    $scope.calculateAge = function calculateAge(birthday) { // birthday is a date
        var ageDifMs = Date.now() - new Date(birthday).getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    $scope.initData = function (storeData) {
        if (!storeData) {
            $state.go('store', {id: null})
            toastr.info('Hãy tạo cửa hàng đầu tiên của bạn')
        } else if (!$rootScope.storeData.location) {
            $state.go('store', {id: null})
            toastr.info('Hãy tạo cửa hàng đầu tiên của bạn')
        } else if (!$rootScope.storeData.job) {
            toastr.info('Hãy cập nhật địa chỉ cửa hàng?')
            $state.go('store', {id: 'job'})
        } else {
            $rootScope.newfilter = {
                job: $rootScope.service.getfirst($rootScope.storeData.job),
                userId: $rootScope.storeId,
                p: 1
            }
            $scope.getUserFiltered($rootScope.newfilter)
        }
    }

    $rootScope.newfilterFilter = function (type, key) {
        $rootScope.newfilter[type] = key
        $rootScope.newfilter.p = 1
        if ($rootScope.newfilter.experience == false) {
            delete $rootScope.newfilter.experience
        }
        if ($rootScope.newfilter.figure == false) {
            delete $rootScope.newfilter.figure
        }

        console.log($rootScope.newfilter)
        $rootScope.usercard = []
        $scope.getUserFiltered($rootScope.newfilter)
    }
    $scope.setAge = function () {
        $scope.age = true
    }
    $scope.age = false;
    $rootScope.newAgeFilter = function (type, key1, key2) {
        $rootScope.jobCard = []
        $rootScope.storeCard = []
        $rootScope.newfilter.p = 1
        $rootScope.newfilter.age1 = key1
        $rootScope.newfilter.age2 = key2
        console.log($rootScope.newfilter)
        $rootScope.usercard = []
        $scope.getUserFiltered($rootScope.newfilter)
        $scope.age = false
    }


    $scope.showVideo = function (user) {
        $scope.showVid = user.userId
        $scope.videoTrusted = $sce.trustAsResourceUrl(user.videourl)
    }

    $scope.loading = false;
    $scope.loadMore = function () {
        console.log('request load')
        if (!$scope.loading && $rootScope.newfilter && $rootScope.newfilter.p < $scope.response.total_pages)  {
            $scope.loading = true;

            console.log('loading')
            $rootScope.newfilter.p++
            $scope.getUserFiltered($rootScope.newfilter);
            $timeout(function () {
                $scope.loading = false;
            }, 500)
        }
    }
    $rootScope.maxMatchUser = 0


    $scope.getUserFiltered = function (newfilter) {
        console.log('filtering..', newfilter)
        $scope.loading = true
        $http({
            method: 'GET',
            url: CONFIG.APIURL + '/api/users',
            params: newfilter
        }).then(function successCallback(response) {
            console.log("respond", response);
            $scope.response = response.data;
            if ($rootScope.maxMatchUser == 0) {
                $rootScope.maxMatchUser = $scope.response.data[0].match
                console.log($rootScope.maxMatchUser)
            }

            $timeout(function () {
                if (!$rootScope.usercard) {
                    $rootScope.usercard = []
                }
                for (var i in $scope.response.data) {
                    var profileData = $scope.response.data[i]
                    $scope.response.data[i].matchPer = Math.round($scope.response.data[i].match * 100 / $rootScope.maxMatchUser)

                    if (profileData.act) {
                        var ref = 'activity/like/' + $rootScope.storeId + ':' + profileData.userId
                        firebase.database().ref(ref).on('value', function (snap) {
                            $scope.response.data[i].act = snap.val()
                        })
                    }

                }
                $rootScope.usercard = $rootScope.usercard.concat($scope.response.data);
                console.log($rootScope.usercard)
                $scope.loading = false
            })
        }, function (error) {
            console.log(error)
            $scope.loading = false

        })


    };


    $scope.applyThis = function (id, key) {
        if ($scope.selectedJob && $scope.selectedJob[id] && $scope.selectedJob[id][key]) {
            delete $scope.selectedJob[id][key]
        } else {

            if (!$scope.selectedJob) {
                $scope.selectedJob = {}
            }
            if (!$scope.selectedJob[id]) {
                $scope.selectedJob[id] = {}
            }
            $scope.selectedJob[id][key] = true;
        }
    };

    $scope.offer = function (id) {
        if (!$scope.jobOffer) {
            $scope.jobOffer = {}
        }
        $scope.jobOffer[id] = true
    }
    $scope.like = function (card, action, selectedJob) {
        AuthUser.storeLike(card, action, selectedJob).then(function (out) {
            console.log(out)
            delete $scope.jobOffer[card.userId]
        })
    };

    $scope.chatto = function (id) {
        $state.go("employer.chats", {to: id, slide: 1})
    };

})
;

'use strict';
app.controller("eSettingCtrl", function ($scope, $ionicModal, $http, $ionicLoading,$state,$cordovaSocialSharing) {
  $scope.$back = function () {
    window.history.back();
  };

  $scope.share = function () {
    $cordovaSocialSharing
      .shareViaFacebook("Tuyển nhân viên nhanh chóng và hiệu quả!", "", 'https://www.facebook.com/jobovietnam')
      .then(function (result) {
        // Success!
      }, function (err) {
        // An error occurred. Show a message to the user
      });

  }
  // to logout
  $scope.doLogout = function () {

    secondary.auth().signOut().then(function () {
      // Sign-out successful.
      console.log("Logout successful");
      $state.go("intro");

    }, function (error) {
      // An error happened.
      console.log(error);
    });

  };


})


"use strict";

app.controller('storeCtrl', storeCtrl)

function storeCtrl($rootScope, $q, $scope, AuthUser, $stateParams, $timeout, $state, toastr, $http, firebase, Upload, usSpinnerService, $sce) {
    var staticData = {
        viewed: 0,
        liked: 0,
        shared: 0,
        rated: 0,
        rateAverage: 0,
        matched: 0,
        chated: 0,
        like: 0,
        share: 0,
        rate: 0,
        match: 0,
        chat: 0,
        timeOnline: 0,
        login: 1,
        profile: 0
    }
    $scope.init = function () {
        $timeout(function () {
            $scope.ByHand = true
        })

        $scope.type = $stateParams.id;
        console.log($scope.type);
        $scope.multiple = {
            industry: [],
            languages: [],
            time: [],
            job: []
        };
        $scope.contact = {}
        $scope.picFile = null;
        $scope.tempoExperience = {}

        if ($scope.type == 'new') {

            $scope.firsttime = true;

            //tạo thêm cửa hàng
            console.log('new');

            AuthUser.user().then(function (result) {
                if (result.name) {
                    $scope.contact.name = true
                }
                if (result.email) {
                    $scope.contact.email = true
                }
                if (result.phone) {
                    $scope.contact.phone = true
                }
                var newstoreKey = 's' + Math.round(100000000000000 * Math.random());
                $rootScope.storeData = {
                    createdBy: result.userId,
                    storeId: newstoreKey,
                    createdAt: new Date().getTime(),
                    job: {},
                }
                $scope.jobData = []

                $rootScope.userData.currentStore = newstoreKey
                $rootScope.storeId = newstoreKey


            }, function (error) {
                console.log(error)
                // error
            });


        } else {

            AuthUser.user().then(function (result) {
                if (result.name) {
                    $scope.contact.name = true
                }
                if (result.email) {
                    $scope.contact.email = true
                }
                if (result.phone) {
                    $scope.contact.phone = true
                }

                console.log(result)
                if (result.currentStore) {

                    $rootScope.service.JoboApi('on/store', {
                        storeId: $rootScope.storeId
                    }).then(function (data) {
                        $rootScope.storeData = data.data
                        if ($rootScope.storeData && $rootScope.storeData.job) {
                            $scope.jobData = $rootScope.storeData.jobData
                        } else {
                            //chưa có job
                            $rootScope.storeData.job = {}
                            $scope.jobData = []
                        }

                        //Đã có, vào để update
                        $scope.autocompleteAddress.text = $rootScope.storeData.address
                    })

                } else {

                    $scope.firsttime = true;

                    //tạo mới đầu
                    console.log('Tạo mới');

                    var newstoreKey = 's' + Math.round(100000000000000 * Math.random());
                    // var newstoreKey = firebase.database().ref('store').push().key;
                    $rootScope.userData.currentStore = newstoreKey
                    $rootScope.storeId = newstoreKey

                    $rootScope.storeData = {
                        createdBy: $rootScope.userId,
                        storeId: newstoreKey,
                        createdAt: new Date().getTime(),
                        job: {}

                    }
                    $scope.jobData = []
                }


            }, function (error) {
                console.log(error)
            });
        }
    }


    //admin note
    $scope.addMoreNote = function () {
        $scope.tempoAdminNote = {};
        $scope.tempoAdminNote.date = new Date();
        $scope.tempoAdminNote.adminId = $scope.adminData.userId;
    };
    $scope.deleteNote = function (id) {
        delete $scope.storeData.adminNote[id]
    };
    $scope.deleteTempNote = function () {
        delete $scope.tempoAdminNote
    }
    $scope.saveNote = function () {

        var newkey = 'p' + Math.round(100000000000000 * Math.random());
        $scope.tempoAdminNote.id = newkey;
        if (!$scope.storeData.adminNote) {
            $scope.storeData.adminNote = {}
        }
        $scope.storeData.adminNote[newkey] = $scope.tempoAdminNote;
        delete $scope.tempoAdminNote
    };

    var admin = $stateParams.admin;
    $scope.admin = $stateParams.admin;
    if (admin) {
        console.log($rootScope.storeId)
        $scope.ByHand = true

        AuthUser.user().then(function (adminInfo) {
            $scope.adminData = adminInfo;
            if ($scope.adminData.admin) {
                $rootScope.storeId = admin;
                $rootScope.service.JoboApi('on/store', {
                    storeId: $rootScope.storeId
                }).then(function (data) {
                    $timeout(function () {
                        $rootScope.storeData = data.data
                        $rootScope.userId = $rootScope.storeData.createdBy
                        $rootScope.service.JoboApi('on/user', {
                            userId: $rootScope.userId
                        }).then(function (datauser) {
                            $timeout(function () {
                                $rootScope.userData = datauser.data
                            })
                        })
                        if ($rootScope.storeData && $rootScope.storeData.jobData) {
                            $scope.jobData = $rootScope.storeData.jobData
                        } else {
                            //chưa có job
                            $rootScope.storeData.job = {}
                            $scope.jobData = []
                        }
                        //Đã có, vào để update
                        $scope.autocompleteAddress.text = $rootScope.storeData.address
                    })
                })
            }
        });
    } else {
        $scope.init()
    }


    $scope.createByHand = function () {
        if ($rootScope.storeData && $rootScope.storeData.googleIns) {
            $rootScope.storeData.industry = $scope.convertIns($rootScope.storeData.googleIns[0])
        }
        $timeout(function () {
            $scope.ByHand = true
        })

    }
    $scope.uploadFiles = function (imageData, errFiles) {
        $scope.startSpin('avatar');

        var uploadRef = firebase.storage().ref().child('images/' + $rootScope.userId + Math.random())
        uploadRef.putString(imageData, 'data_url').then(function (snapshot) {
            console.log('Uploaded a base64 string!', snapshot);
            var downloadURL = snapshot.downloadURL;
            console.log(downloadURL);
            $rootScope.storeData.avatar = downloadURL;
            $scope.$apply(function () {
                $scope.stopSpin('avatar');
                delete $scope.picFile
            })
        });

    };

//Store
    $scope.autocompleteStore = {text: ''};
    $scope.searchStore = function () {
        var params = {
            query: S($scope.autocompleteStore.text).latinise().s
        }
        $http({
            method: 'GET',
            url: $rootScope.CONFIG.APIURL + '/api/places',
            params: params
        }).then(function successCallback(response) {
            $scope.ketquasStore = response.data.results;
            console.log($scope.ketquasStore);
            $('#list-store').show();
        })
    };
    $scope.setSelectedStore = function (selected) {
        $scope.location = selected;
        console.log($scope.location)
        $rootScope.storeData.location = {};
        $rootScope.storeData.storeName = $scope.location.name;
        $rootScope.storeData.address = $scope.location.formatted_address;
        $rootScope.storeData.location.lat = $scope.location.geometry.location.lat;
        $rootScope.storeData.location.lng = $scope.location.geometry.location.lng;
        $rootScope.storeData.googleIns = $scope.location.types;
        $scope.autocompleteStore.text = $scope.location.name
        $scope.autocompleteAddress.text = $scope.location.formatted_address
        console.log($rootScope.storeData)
        $('#list-store').hide();

    };
    $scope.eraseStore = function () {
        $scope.autocompleteStore.text = null;
        $('#list-store').hide();
    }

//address
    $scope.autocompleteAddress = {text: ''};
    $scope.ketquasAddress = [];

    var delay = false
    $scope.searchAddress = function (textfull) {
        var text = S(textfull).latinise().s
        $scope.URL = 'https://maps.google.com/maps/api/geocode/json?address=' + S($scope.autocompleteAddress.text).latinise().s + '&components=country:VN&sensor=true&key=' + $rootScope.CONFIG.APIKey;
        if (delay == false) {
            delay = true
            $http({
                method: 'GET',
                url: $scope.URL
            }).then(function successCallback(response) {
                $scope.ketquasAddress = response.data.results;
                console.log($scope.ketquasAddress);
                $('#list-add').show();
            });
            $timeout(function () {
                delay = false
            }, 1000)
        }
    };
    $scope.setSelectedAddress = function (selected) {
        $scope.autocompleteAddress.text = selected.formatted_address;
        $scope.address = selected;
        $rootScope.storeData.address = selected.formatted_address;
        $rootScope.storeData.location = selected.geometry.location;

        console.log(selected);
        $('#list-add').hide();

    };
    $scope.eraseAddress = function () {
        $scope.autocompleteAddress.text = null;
        $('#list-add').hide();
    }

//upload more image
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    $scope.$watch('file', function () {
        if ($scope.file != null) {
            $scope.files = [$scope.file];
        }
    });
    $scope.log = {};
    $scope.deleteImage = function (images) {
        console.log('clicked', images)
        $rootScope.storeData.photo.splice(images, 1);
    }

    $scope.upload = function (files) {
        $scope.startSpin('photo');
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (!file.$error) {

                    var metadata = {
                        'contentType': file.type
                    };
                    var storageRef = firebase.storage().ref();
                    var uploadTask = {};

                    uploadTask[i] = storageRef.child('images/' + $rootScope.userId + Math.random()).put(file, metadata);

                    uploadTask[i].then(function (snapshot) {
                        var downloadURL = snapshot.downloadURL;
                        console.log(downloadURL);
                        if (!$rootScope.storeData.photo) {
                            $rootScope.storeData.photo = []
                        }
                        $rootScope.storeData.photo.push(downloadURL);
                    });

                    uploadTask[i].on('state_changed', function (snapshot) {
                        $timeout(function () {
                            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            $scope.log[i] = progress + '%';
                            console.log('Upload is ' + progress + '% done');
                        });
                        // Observe state change events such as progress, pause, and resume
                    }, function (error) {
                        // Handle unsuccessful uploads
                    }, function () {
                        // Handle successful uploads on complete
                        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                        $scope.stopSpin('photo')
                    })

                }
            }
        }
    };

    $scope.workTime = [
        '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00',
        '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
        '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
        '21:00', '22:00', '23:00'];
    $scope.addWorkTime = function (start, end, type) {
        if ((start !== undefined && end !== undefined) && (start !== null && end !== null)) {
            if (type === 'new') {
                $scope.newJob.work_time.push({
                    start: start,
                    end: end
                });
            } else {
                if (!$scope.jobData[type].work_time) {
                    $scope.jobData[type].work_time = [];
                }
                console.log(type);
                $scope.jobData[type].work_time.push({
                    start: start,
                    end: end
                });
                console.log($scope.jobData[type])
            }
        }
    };
    $scope.deleteWorkTime = function (id, type) {
        if (type === 'new') {
            $scope.newJob.work_time.splice(id, 1);
        } else {
            console.log(type);
            $scope.jobData[type].work_time.splice(id, 1);
        }
    };

    $scope.addJob = function () {
        $scope.newJob = {
            createdBy: $rootScope.userId,
            storeId: $rootScope.storeId,
            address: $rootScope.storeData.address,
            location: $rootScope.storeData.location,
            storeName: $rootScope.storeData.storeName,
            work_time: []
        }
    };
    $scope.saveJob = function () {
        if (!$scope.jobData) {
            $scope.jobData = []
        }
        if (!$scope.anaJob) {
            $scope.anaJob = []
        }
        if ($scope.newJob.job == 'other') {
            $scope.newJob.job = $scope.newJob.other
        }

        console.log($scope.newJob)

        if ($scope.newJob.job) {
            $scope.jobData.push($scope.newJob);
            console.log($scope.jobData);
            $scope.anaJob.push($scope.newJob.job);

            delete $scope.newJob
        } else {
            toastr.error('Bạn chưa cập nhật vị trí mong muốn');
        }
    };
    $scope.deleteJob = function (id) {
        if (confirm("Bạn muốn xoá job " + [$rootScope.Lang[$scope.jobData[id].job] || $scope.jobData[id].other] + "?") === true) {
            console.log($scope.jobData[id]);
            delete $rootScope.storeData.job[$scope.jobData[id].job];
            $rootScope.service.JoboApi('delete/job', {
                jobId: $scope.jobData[id].storeId + ':' + $scope.jobData[id].job
            });
            $scope.jobData.splice(id, 1);
            console.log($rootScope.storeData);
            console.log($scope.jobData);
        }

    };
    $scope.deleteNewJob = function () {
        delete $scope.newJob;
    };
    $scope.submit = function () {
        console.log('submit', $rootScope.storeData)
        $scope.error = $rootScope.userData;

        if ($rootScope.userData.name
            && $rootScope.userData.email
            && $rootScope.userData.phone
            && $rootScope.storeData.location
            && $rootScope.storeData.storeName
            && $rootScope.storeData.industry) {

            for (var i in $scope.jobData) {
                var job = $scope.jobData[i];
                if ($scope.jobData[i].deadline) {
                    $scope.jobData[i].deadline = new Date($scope.jobData[i].deadline).getTime()
                    console.log($scope.jobData[i].deadline)
                }
                if (!$scope.jobData[i].createdAt) {
                    $scope.jobData[i].createdAt = new Date().getTime()
                }
                delete $scope.jobData[i].$$hashKey
                for (var j in $scope.jobData[i].work_time) {
                    delete $scope.jobData[i].work_time[j].$$hashKey;
                }

                if ($scope.jobData[i].other) {
                    var jobkey = $rootScope.service.latinese($scope.jobData[i].job);
                    $rootScope.storeData.job[jobkey] = $scope.jobData[i].job;
                    $scope.jobData[i].job = jobkey;
                } else {
                    if (!$rootScope.storeData.job) {
                        $rootScope.storeData.job = {}

                    }

                    $rootScope.storeData.job[$scope.jobData[i].job] = true;
                }


            }

            delete $rootScope.storeData.adminData;
            delete $rootScope.storeData.jobData;


            $rootScope.storeData.storeId = $rootScope.storeId;
            $rootScope.service.JoboApi('update/user', {
                userId: $rootScope.userId,
                storeId: $rootScope.storeId,
                user: $rootScope.userData,
                store: $rootScope.storeData
            }).then(function (res) {
                toastr.success('Cập nhật thông tin thành công')
                $rootScope.service.JoboApi('update/job', {
                    userId: $rootScope.userId,
                    job: JSON.stringify($scope.jobData)
                }).then(function (res) {
                    toastr.success('Cập nhật vị trí thành công')
                    if ($scope.firsttime) {
                        $rootScope.service.Ana('createStore');
                        toastr.success('Tạo cửa hàng thành công')
                    } else {
                        $rootScope.service.Ana('updateStore', {job: $scope.anaJob || ''});
                        toastr.success('Cập nhật thành công')
                    }
                    if ($scope.adminData && $scope.adminData.admin) {
                        $timeout(function () {
                            window.location.href = "/view/store/" + $rootScope.storeId;
                        });
                    } else {
                        $state.go('app.edash')
                    }
                });

            }).catch(function (err) {
                toastr.error('Lỗi')

            });


        } else {
            $scope.error = {};
            if (!$rootScope.userData.name) {
                $scope.error.name = true;
            }
            if (!$rootScope.userData.email) {
                $scope.error.email = true;
            }
            if (!$rootScope.userData.phone) {
                $scope.error.phone = true;
            }
            if (!$rootScope.storeData.storeName) {
                $scope.error.storeName = true;
            }
            if (!$rootScope.storeData.industry) {
                $scope.error.industry = true;
            }
            if (!$rootScope.storeData.location) {
                $scope.error.location = true;
            }
            console.log($scope.error);
            toastr.error('Bạn chưa cập nhật đủ thông tin', 'Lỗi');
        }
    }
    $scope.startSpin = function (spin) {
        usSpinnerService.spin(spin);
    }
    $scope.stopSpin = function (spin) {
        usSpinnerService.stop(spin);
    }
    $scope.convertIns = function (job) {
        var card = $rootScope.CONFIG.data.convertIns

        var converted;
        if
        (card.beauty_salon[job]) {
            converted = 'beauty_salon'
        } else if (card.store[job]) {
            converted = 'store'

        } else if (card.restaurant_bar[job]) {
            converted = 'restaurant_bar'

        } else if (card.education_centre[job]) {
            converted = 'education_centre'

        } else if (card.resort[job]) {
            converted = 'resort'

        } else if (card.real_estate[job]) {
            converted = 'real_estate'
        } else if (card.supermarket_cinema[job]) {
            converted = 'supermarket_cinema'
        } else if (card.unique[job]) {
            converted = job

        } else {
            converted = 'other'
        }
        console.log('converted', converted)
        return converted
    }

}

"use strict";

app.controller("ViewProfileCtrl", function ($scope, $stateParams, $sce, $rootScope, $http, CONFIG, $timeout, $state, AuthUser) {

    $(document).ready(function () {
        $('[data-toggle="popover"]').popover();
    });


    $scope.init = function () {
        $rootScope.aside = false
        $scope.profileId = $stateParams.id;
        $scope.admin = $stateParams.admin;

        if ($scope.profileId) {
            $http({
                method: 'GET',
                url: CONFIG.APIURL + '/view/profile',
                params: {profileId: $scope.profileId, userId: $rootScope.userId}
            }).then(function successCallback(response) {
                console.log("respond", response);
                $scope.profileData = response.data
                $scope.adminData = $scope.profileData.adminData
                $scope.listReact = $scope.profileData.actData
                $scope.reviewData = $scope.profileData.review;
                if ($scope.reviewData) {
                    $timeout(function () {
                        $scope.ratingModel = $rootScope.service.calReview($scope.reviewData);
                        console.log($scope.ratingModel)
                    })
                }


                $scope.limit = {like: 10, liked: 10, match: 10}


                $scope.incrementLimit = function (type) {
                    $scope.limit[type] = $scope.listReact[type].length
                }
                var profileJob = $rootScope.service.getStringJob($scope.profileData.job);
                console.log(profileJob);
                $scope.share = {
                    Url: "web.joboapp.com/view/profile/" + $scope.profileId,
                    Text: 'Ứng viên ' + $scope.profileData.name,
                    Title: "Ứng viên" + $scope.profileData.name,
                    Description: 'Xem thông tin ứng viên ' + $scope.profileData.name + " cho vị trí " + profileJob,
                    Type: 'feed',
                    Media: $scope.profileData.avatar,
                    Via: '295208480879128',
                    Hashtags: 'jobo,timviecnhanh,pg,sale,model',
                    Caption: 'Có ai đang cần tuyển ' + profileJob + ' không nhỉ? Mình vừa mới tìm thấy ứng viên này, thử vào Jobo xem thông tin chi tiết rồi cho mình biết bạn nghĩ sao nhé ;) #jobo #timviecnhanh #pg #sale #model'
                }
                $rootScope.og = {
                    title: 'Ứng viên ' + $scope.profileData.name,
                    description: 'Xem thông tin ứng viên ' + $scope.profileData.name + " cho vị trí " + profileJob,
                    image: $scope.profileData.avatar
                }
            })

            $rootScope.service.Ana('viewProfile', {userId: $scope.profileId})

        }

        if (!$rootScope.userId) {
            $rootScope.$on('handleBroadcast', function (event, userData) {
                $scope.init()
            });
        }

        $scope.indexCurrent = 0;
        if ($rootScope.usercard) {
            for (var i in $rootScope.usercard) {
                if ($rootScope.usercard[i].userId == $scope.profileId) {
                    $scope.indexCurrent = i;
                    console.log($scope.indexCurrent)
                    break
                }
            }
        }

    };


    $scope.API = null;

    $scope.onPlayerReady = function (API) {
        $scope.API = API;
    };
    $scope.rating = 3
    $scope.rateFunction = function (rating) {
        $scope.reviews = {
            name: $rootScope.storeData.storeName,
            avatar: $rootScope.storeData.avatar || "",
            userId: $rootScope.storeId,
            rate: rating,
            createdAt: new Date().getTime(),
            type: $rootScope.type,
            profileId: $scope.profileId

        };
        console.log('Rating selected: ' + rating);
    };
    $scope.review = function (reviews) {
        $rootScope.service.JoboApi('update/review', {
            reviews: reviews
        })
        /*var reviewAct = firebase.database().ref('activity/review/' + profileId + '/' + reviews.userId)
         reviewAct.update(reviews)*/
    }

    $scope.showVideo = function (user) {
        $scope.showVid = true
        $scope.videoTrusted = $sce.trustAsResourceUrl(user.videourl)
    }
    $scope.hideVideo = function () {
        delete $scope.showVid

    }
    $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
    };

    $scope.calculateAge = function calculateAge(birthday) { // birthday is a date
        var ageDifMs = new Date().getFullYear() - birthday
        return ageDifMs
    };


    $scope.nextProfile = function () {
        var next = +$scope.indexCurrent + +1
        console.log(next);
        var nextUserId = $rootScope.usercard[next].userId
        $state.go('app.viewprofile', {id: nextUserId})
    }
    $scope.backProfile = function () {
        var back = +$scope.indexCurrent - +1
        console.log(back);
        var backUserId = $rootScope.usercard[back].userId
        $state.go('app.viewprofile', {id: backUserId})
    }


    $scope.applyThis = function (id, key) {
        if ($scope.selectedJob && $scope.selectedJob[id] && $scope.selectedJob[id][key]) {
            delete $scope.selectedJob[id][key]
            console.log($scope.selectedJob)
        } else {

            if (!$scope.selectedJob) {
                $scope.selectedJob = {}
            }
            if (!$scope.selectedJob[id]) {
                $scope.selectedJob[id] = {}
            }
            $scope.selectedJob[id][key] = true;
            console.log($scope.selectedJob)

        }
    };


    $scope.like = function (card, action, selectedJob) {
        AuthUser.storeLike(card, action, selectedJob).then(function (result) {
            console.log(result)
            $scope.result = result
        })
    };

    $scope.chatto = function (id) {
        $state.go("employer.chats", {to: id, slide: 1})
    };


});

"use strict"

angular.module('app').controller('dashboardCtrl', dashboardCtrl);

function dashboardCtrl($scope, $timeout, $sce, toastr, $state, CONFIG, $http, $rootScope) {
    $scope.loading = true
    $rootScope.aside = false
    $scope.showjob = 1;


    if (!$rootScope.UserCard && !$rootScope.StoreCard) {
        $http({
            method: 'GET',
            url: CONFIG.APIURL + '/api/dashboard'
        }).then(function successCallback(response) {
            console.log("respond", response);
            $timeout(function () {
                $rootScope.UserCard = response.data.jobseeker;
                $rootScope.StoreCard = response.data.employer
            })
        }, function (error) {
            console.log(error)
        })
        $http({
            method: 'GET',
            url: CONFIG.APIURL + '/dash/job?lat=10.779942&lng=106.704354'
        }).then(function successCallback(response) {
            console.log("respond", response);
            $timeout(function () {
                if (!$rootScope.JobCard) {
                    $rootScope.JobCard = {}
                }
                $rootScope.JobCard.sg = response.data;
            })
        }, function (error) {
            console.log(error)
        })

        $http({
            method: 'GET',
            url: CONFIG.APIURL + '/dash/job?lat=21.0225499&lng=105.8441781'
        }).then(function successCallback(response) {
            console.log("respond", response);
            $timeout(function () {
                if (!$rootScope.JobCard) {
                    $rootScope.JobCard = {}
                }
                $rootScope.JobCard.hn = response.data;
            })
        }, function (error) {
            console.log(error)
        })
        $http({
            method: 'GET',
            url: CONFIG.APIURL + '/api/job?working_type=seasonal'
        }).then(function successCallback(response) {
            console.log("respond", response);
            $timeout(function () {
                if (!$rootScope.JobCard) {
                    $rootScope.JobCard = {}
                }
                $rootScope.JobCard.ss = response.data.data;
            })
        }, function (error) {
            console.log(error)
        })
    }
    $scope.showVideo = function (user) {
        $rootScope.service.Ana('show_video', {watched: user.userId})
        $scope.showVid = user.userId
        $scope.videoTrusted = $sce.trustAsResourceUrl(user.videourl)
    }


    $scope.sortFilter = function (param) {
        $rootScope.newfilter = {
            show: param
        }
        $rootScope.JobCard = {}
        $scope.getUserFiltered($rootScope.newfilter)

    }
    $scope.newfilterFilter = function () {
        toastr.info('Bạn phải đăng nhập để thực hiện tác vụ này!');
        $state.go('intro')

    };
    $scope.changefilter = function () {
        $rootScope.service.Ana('createProfile', {where: 'haytaohoso'})

        console.log('click');
        toastr.info('Hãy đăng ký tài khoản và bắt đầu tạo hồ sơ!');
        $state.go('signup', {id: 2})

    }
    $scope.change = function () {
        console.log('click')
        toastr.info('Bạn phải đăng nhập để thực hiện tác vụ này!');
        $state.go('signup', {id: 1})

    }


    $(window).load(function () {
        $('.post-module').hover(function () {
            $(this).find('.description').stop().animate({
                height: "toggle",
                opacity: "toggle"
            }, 300);
        });
    });
}

"use strict";


app.controller('introController', function ($state, $scope, $rootScope, $timeout, CONFIG, toastr, ModalService) {

    secondary.auth().getRedirectResult().then(function (result) {
        if (result.credential) {
            toastr.info('Đang đăng nhập bằng Facebook...');

            var token = result.credential.accessToken;

            var credential = firebase.auth.FacebookAuthProvider.credential(token);

            SignInWithCredential(credential);
        }

    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        toastr.error(errorMessage)
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });

    $scope.button = "Đăng nhập";

    $scope.facebookLogin = function () {

        var provider = new firebase.auth.FacebookAuthProvider();
        secondary.auth().signInWithRedirect(provider);
    }


    function SignInWithCredential(credential) {
        secondary.auth().signInWithCredential(credential).then(function (result) {
            var user = secondary.auth().currentUser || result;
            var userData = {
                userId: user.uid,
                name: user.displayName,
                email: user.email,
                createdAt: new Date().getTime(),
            };

            console.log(user);
            checkSignupOrSignIn(userData);
        }, function (error) {
            console.log(error)
        })

    }


    function checkSignupOrSignIn(userData) {
        $rootScope.service.JoboApi('on/user', {userId: userData.userId}).then(function (data) {
            console.log('checkSignupOrSignIn', data.data);
            var userDataLoad = data.data;
            if (userDataLoad && userDataLoad.type) {
                toastr.success('Đăng nhập thành công');
                var type = userDataLoad.type;
                if (type == 1) {
                    console.log('employer go to');

                    $state.go('app.edash')
                }
                if (type == 2) {
                    $state.go('app.sdash')
                }
            } else {

                console.log('Đăng ký');

                if (!type) {

                    ModalService.showModal({
                        templateUrl: 'templates/modals/choosetype.html',
                        controller: 'ModalController'
                    }).then(function (modal) {
                        modal.element.modal();
                        modal.close.then(function (result) {
                            if (result == 1 || 2) {
                                createDataUser(userData.userId, userData, result)
                            }
                        });
                    });
                    // A confirm dialog
                }
                if (type) {
                    console.log('has type');

                    createDataUser(userData.userId, userData, type)
                }

            }
        });
    }

    function createDataUser(userId, userData, type) {
        userData.type = type;
        $rootScope.service.JoboApi('update/user', {
            userId: userId,
            user: userData
        });
        // userRef.update(userData);
        toastr.success('Đăng ký thành công')
        if (userData.type == 1) {
            $state.go('store', {id: null})
        }
        if (userData.type == 2) {
            $state.go('profile')
        }
    }


    $scope.doLogin = function (userLogin) {

        $scope.button = "Đang đăng nhập...";

        console.log(userLogin);
        secondary.auth().signInWithEmailAndPassword(userLogin.username, userLogin.password).then(function () {

            $rootScope.userId = secondary.auth().currentUser.uid;
            $rootScope.service.JoboApi('on/user', {
                userId: $rootScope.userId
            }).then(function (data) {
                $rootScope.type = data.data.type;
                console.log($rootScope.type);
                toastr.success('Đăng nhập thành công...')

                if ($rootScope.type == 1) {
                    $state.go('app.edash')
                }
                if ($rootScope.type == 2) {
                    $state.go('app.sdash')
                }
            });

        }, function (error) {

            $scope.button = "Đăng nhập...";

            // An error happened.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode);
            if (errorCode === 'auth/invalid-email') {
                toastr.error('Kiểm tra lại email.');
                return false;
            } else if (errorCode === 'auth/wrong-password') {
                toastr.error('Mật khẩu không đúng.');
                return false;
            } else if (errorCode === 'auth/argument-error') {
                toastr.error('Password must be string.');
                return false;
            } else if (errorCode === 'auth/user-not-found') {
                toastr.error('Email này không tồn tại.');
                return false;
            } else if (errorCode === 'auth/too-many-requests') {
                toastr.error('Too many failed login attempts, please try after sometime.');
                return false;
            } else if (errorCode === 'auth/network-request-failed') {
                toastr.error('Request timed out, please try again.');
                return false;
            } else {
                toastr.error(errorMessage);
                return false;
            }

        });


    };
// end $scope.doLogin()


})
    .controller('resetController', function ($scope, $state, $document, toastr) {

        $scope.doResetemail = function (userReset) {

            //console.log(userReset);

            if (userReset != "") {


                secondary.auth().sendPasswordResetEmail(userReset).then(function () {
                    // Sign-In successful.
                    toastr.success("Reset email sent successful");

                    $state.go("login");


                }, function (error) {
                    // An error happened.
                    var errorCode = error.code;
                    console.log(errorCode);

                    if (errorCode === 'auth/user-not-found') {
                        toastr.error('Email này không đúng.');
                        return false;
                    } else if (errorCode === 'auth/invalid-email') {
                        toastr.error('Email you entered is not complete or invalid.');
                        return false;
                    }

                });


            } else {

                toastr.error('Please enter registered email to send reset link');
                return false;

            }//end check client username password


        };


    })

    .controller('signupCtrl', function ($scope, $rootScope, $stateParams, $http, $state, ModalService, toastr, $timeout) {

        var type = $stateParams.id;
        if ($stateParams.apply) {
            if (type == 2) {
                $rootScope.service.JoboApi('on/store', {
                    storeId: $stateParams.apply
                }).then(function (data) {
                    $timeout(function () {
                        $rootScope.preApply = {
                            card: data.data,
                            jobOffer: $stateParams.job
                        }
                        console.log('$rootScope.preApply', $rootScope.preApply)
                    })
                });
                /*firebase.database().ref('store/' + $stateParams.apply).once('value', function (snap) {
                    $timeout(function () {
                        $rootScope.preApply = {
                            card: snap.val(),
                            jobOffer: $stateParams.job
                        }
                        console.log('$rootScope.preApply', $rootScope.preApply)
                    })

                })*/

            }
        }


        $scope.type = type;

        secondary.auth().getRedirectResult().then(function (result) {
            if (result.credential) {
                toastr.info('Đang đăng nhập bằng Facebook...');

                var token = result.credential.accessToken;

                var credential = firebase.auth.FacebookAuthProvider.credential(token);

                SignInWithCredential(credential);
            }

        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            toastr.error(errorMessage)
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
        });

        $scope.facebookLogin = function () {
            var provider = new firebase.auth.FacebookAuthProvider();
            secondary.auth().signInWithRedirect(provider);
        };


        function SignInWithCredential(credential) {
            secondary.auth().signInWithCredential(credential).then(function (result) {
                var user = secondary.auth().currentUser || result;
                var userData = {
                    userId: user.uid,
                    name: user.displayName,
                    email: user.email,
                    provider: 'facebook'
                };

                console.log(user);
                checkSignupOrSignIn(userData);
            }, function (error) {
                console.log(error)
            })

        }


        function checkSignupOrSignIn(userData) {
            $rootScope.service.JoboApi('on/user', {userId: userData.userId}).then(function (data) {
                console.log('checkSignupOrSignIn', JSON.stringify(data.data));
                var userDataLoad = data.data;
                if (userDataLoad && userDataLoad.type) {
                    toastr.success('Đăng nhập')
                    var type = userDataLoad.type
                    if (type == 1) {
                        console.log('employer go to');

                        $state.go('app.edash')
                    }
                    if (type == 2) {
                        $state.go('app.sdash')
                    }
                } else {

                    toastr.success('Đăng ký')

                    if (!$scope.type) {

                        ModalService.showModal({
                            templateUrl: 'templates/modals/address.html',
                            controller: 'ModalController'
                        }).then(function (modal) {
                            modal.element.modal();
                            modal.close.then(function (result) {
                                if (result == 1 || 2) {
                                    createDataUser(userData.userId, userData, result)
                                }
                            });
                        });
                        // A confirm dialog
                    }
                    if ($scope.type) {
                        console.log('has type');

                        createDataUser(userData.userId, userData, $scope.type)
                    }


                }
            });
            /*var userRef = firebase.database().ref("user/" + userData.userId);
            userRef.once('value', function (snap) {
                console.log('checkSignupOrSignIn', JSON.stringify(snap.val()));
                var userDataLoad = snap.val();
                if (userDataLoad) {
                    toastr.success('Đăng nhập')
                    var type = userDataLoad.type
                    if (type == 1) {
                        console.log('employer go to');

                        $state.go('app.edash')
                    }
                    if (type == 2) {
                        $state.go('app.sdash')
                    }
                } else {

                    toastr.success('Đăng ký')

                    if (!$scope.type) {

                        ModalService.showModal({
                            templateUrl: 'templates/modals/address.html',
                            controller: 'ModalController'
                        }).then(function (modal) {
                            modal.element.modal();
                            modal.close.then(function (result) {
                                if (result == 1 || 2) {
                                    createDataUser(userData.userId, userData, result)
                                }
                            });
                        });
                        // A confirm dialog
                    }
                    if ($scope.type) {
                        console.log('has type');

                        createDataUser(userData.userId, userData, $scope.type)
                    }


                }
            })*/

        }

        function createDataUser(userId, userData, type) {
            userData.type = type;
            userData.createdAt = new Date().getTime();
            var refer = window.localStorage.getItem('ref')
            if (refer) {
                userData.ref = refer;
            }
            $rootScope.service.JoboApi('update/user', {
                userId: userId,
                user: JSON.stringify(userData)
            });
            // userRef.update(userData);
            if (userData.type == 1) {
                $state.go('store', {id: null})
            }
            if (userData.type == 2) {
                $state.go('profile')
            }
        }


        $scope.doSignup = function (userSignup) {

            $rootScope.registering = true;
            secondary.auth().createUserWithEmailAndPassword(userSignup.username, 'tuyendungjobo').then(function (user) {

                $rootScope.userId = user.uid;
                // $scope.usersRef = firebase.database().ref('user/' + user.uid);
                var userData = {
                    type: $scope.type,
                    phone: '',
                    userId: user.uid,
                    email: userSignup.username,
                    provider: 'normal'
                };
                createDataUser(user.uid, userData, $scope.type)

                toastr.success("Đăng ký thành công, mật khẩu đăng nhập của bạn là: tuyendungjobo");
                if ($scope.type == 1) {
                    $state.go('store', {id: null})
                }
                if ($scope.type == 2) {
                    $state.go('profile')
                }

            }, function (error) {

                // An error happened.
                var errorCode = error.code;
                console.log(errorCode);

                if (errorCode === 'auth/weak-password') {

                    toastr.error('Mật khẩu ngắn, hãy chọn mật khẩu khác!');

                    return false;
                } else if (errorCode === 'auth/email-already-in-use') {
                    toastr.error('Email này đã được sử dụng rồi');

                    return false;
                }
            });
        };

    })

'use strict';
app.controller("settingCtrl", function ($scope, $rootScope, $http, $state, toastr,$timeout) {
    $scope.init = function () {
        $rootScope.aside = false
        if($rootScope.userId){
            init()
        }
        $scope.$on('handleBroadcast', function (event, message) {
            init()
        })
    };
    function init() {
        $rootScope.service.JoboApi('on/setting',{
            userId: $rootScope.userId
        }).then(function (data) {
            $timeout(function () {
                $scope.setting = data.data;
                console.log($scope.setting)
            })
        });

        $rootScope.service.JoboApi('on/user',{
            userId: $rootScope.userId
        }). then(function (data) {
            $scope.userData = data.data;
        });

    }

    $scope.submit = function (noti) {
        $rootScope.service.JoboApi('update/setting',{
            userId: $rootScope.userId,
            setting: noti
        }).then(function () {
            toastr.success('Cập nhật thành công')
        },function (error) {
            toastr.error(error)
        });



    }




})

